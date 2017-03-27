module.exports = {
  log,
  template,
  fail,
  spawn
}

const _spawn = require('cross-spawn')
const debug = require('debug')('ngx')

function spawn (command, args) {
  debug('spawn %s %s', command, args.join(' '))

  const p = _spawn(command, args, {
    stdio: 'inherit'
  })

  return new Promise((resolve, reject) => {
    p.on('close', (code) => {
      if (code === 0) {
        return resolve()
      }

      reject(new Error(`command exit with code ${code}`))
    })
  })
}


const typo = require('typo')()
.use(require('typo-chalk'))

function log (t, data) {
  const str = template(t, data)
  console.log(str)
}


function template (t = '', data = {}) {
  return typo.template(t, data, {
    async: false
  })
}


function fail (message) {
  message = template('{{white.bgRed Error}} ') + (
    message instanceof Error
      ? message.stack
      : message
  )

  console.error(message)
  process.exit(1)
}

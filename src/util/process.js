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

  const p = spawn(command, args, {
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

function log (t, error, data) {
  const str = template(t, error, data)

  error
    ? console.error(str)
    : console.log(str)
}


function template (t = '', error, data = {}) {
  if (error) {
    t = '{{white.bgRed Error}} ' + t
  }

  return typo.template(t, data, {
    async: false
  })
}


function fail (template, data = {}) {
  if (template instanceof Error) {
    debug('fail with error: %s', template.stack)
    return process.exit(1)
  }

  log(template, true, data)
  process.exit(1)
}

const spawn = require('cross-spawn')
const once = require('once')
const debug = require('debug')('gaia')
const {log, template} = require('./utils')

module.exports = (command, args) => {
  debug('spawn %s %s', command, args.join(' '))

  const p = spawn(command, args, {
    stdio: 'inherit'
  })

  return new Promise((resolve, reject) => {
    reject = once(reject)

    p.on('close', (code) => {
      if (code === 0) {
        return resolve()
      }

      log(`command exit with code ${code}`, true)
    })
  })
}

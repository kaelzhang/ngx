import _spawn from 'cross-spawn'
import _debug from 'debug'

const debug = _debug('ngx')

export function spawn (command, args) {
  debug('spawn %s %s', command, args.join(' '))

  const p = _spawn(command, args, {
    stdio: 'inherit'
  })

  return new Promise((resolve, reject) => {
    p.on('close', (code) => {
      if (code === 0) {
        return resolve()
      }

      const error = new Error(`command exit with code ${code}`)
      error.code = 'ERR_CHILD_PROCESS'
      error.exitCode = code
      reject(error)
    })
  })
}


import _typo from 'typo'

const typo = _typo()
.use(require('typo-chalk'))

export function log (t, data) {
  const str = template(t, data)
  console.log(str)
}


export function template (t = '', data = {}) {
  return typo.template(t, data, {
    async: false
  })
}


export function fail (err) {
  const is_error = err instanceof Error

  const message = template('{{white.bgRed Error}} ') + (
    is_error
      ? err.stack
      : message
  )

  const code = is_error
    ? err.exitCode
      ? err.exitCode
      : 1
    : 1

  console.error(message)
  process.exit(1)
}

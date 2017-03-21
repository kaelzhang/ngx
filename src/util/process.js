

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
    console.error(template.stack)
    return process.exit(1)
  }

  log(template, true, data)
  process.exit(1)
}


function env (env = 'production') {
  process.env.GAIA_ENV = env
}


const program = require('commander')

program
// If we use sudo, we could not specify env by
//  GAIA_ENV=production gaia reload
.option('-e, --env [env]', 'specify environment')

const _parse = program.parse
program.parse = (argv) => {
  const ret = _parse.call(program, argv)
  env(program.env)
  return ret
}

function commander () {
  return program
}


function parse () {
  return commander().parse(process.argv)
}
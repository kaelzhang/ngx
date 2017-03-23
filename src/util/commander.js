

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
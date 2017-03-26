const program = require('commander')
const path = require('path')

program
// If we use sudo, we could not specify env by
//  NGX_ENV=production ngx reload
.option('-e, --env [env]', 'specify environment')
.option('--cwd [cwd]', 'set current working directory')

function parse () {
  program.parse(process.argv)

  program.cwd = program.cwd
    ? path.resolve(program.cwd)
    : process.cwd()

  program.env = program.env || 'production'
}

module.exports = {
  program,
  parse
}

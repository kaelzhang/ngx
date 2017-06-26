import program from 'commander'
import path from 'path'

program
// If we use sudo, we could not specify env by
//  NGX_ENV=production ngx reload
.option('-e, --env [env]', 'specify environment, defaults to "production"')
.option('--cwd [cwd]', 'set current working directory')

export {program}

export function parse () {
  program.parse(process.argv)

  program.cwd = program.cwd
    ? path.resolve(program.cwd)
    : process.cwd()

  program.env = program.env || 'production'
}

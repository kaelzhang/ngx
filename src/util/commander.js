import program from 'commander'
import path from 'path'

program
// If we use sudo, we could not specify env by
//  NGX_ENV=production ngx reload
.option('-e, --env [env]', 'specify environment, defaults to "production"')
.option('-c, --cwd [cwd]', 'set current working directory')
.option('-u, --user [user]', 'define the <user>:<group> used by worker processes')

export {program}


const NOOP = function () {}

export function parse (extra = NOOP) {
  extra(program)

  program.parse(process.argv)

  program.cwd = program.cwd
    ? path.resolve(program.cwd)
    : process.cwd()

  if (program.user) {
    const splitted = program.user.split(':')
    program.user = splitted[0]
    program.group = splitted[1] || splitted[0]
  }

  return program
}

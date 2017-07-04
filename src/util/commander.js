import program from 'commander'
import path from 'path'

program
// If we use sudo, we could not specify env by
//  NGX_ENV=production ngx reload
.option('-e, --env [env]', 'specify environment, defaults to "production"')
.option('-c, --cwd [cwd]', 'set current working directory')
.option('-u, --user [user]', 'define the <user:group> used by worker processes')

export {program}

export function parse () {
  program.parse(process.argv)

  const cwd = program.cwd
    ? path.resolve(program.cwd)
    : process.cwd()

  const env = program.env || 'production'

  const options = {
    cwd,
    env,
    args: program.args
  }

  if (program.user) {
    const splitted = program.user.split(':')
    options.user = splitted[0]
    options.group = splitted[1] || options.user
  }

  return options
}

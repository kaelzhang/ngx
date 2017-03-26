#!/usr/bin/env node

const {
  program,
  parse
} = require('../util/commander')

const {
  fail,
  log
} = require('../util/process')

const {
  parseOptions,
  reload,
  build
} = require('..')

program.usage('<ip>[:<port>] ... [options]')
parse()

const cwd = program.cwd
const env = program.env
const servers = program.args

if (!servers || !servers.length) {
  return fail('no server specified')
}

parseOptions({cwd, options: {env}})
.then(opts => {
  const upstreams = opts.data.upstreams

  servers.forEach(server => {
    const [ip, port] = server.split(':').map(x => x.trim())

    log(`{{cyan remove}} upstream server: ${ip}:${port}`)
    upstreams.remove(ip, port)
  })

  return opts
})
.then(build)
.then(reload)
.catch(fail)

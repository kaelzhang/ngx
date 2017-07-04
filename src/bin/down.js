#!/usr/bin/env node

import {
  program,
  parse
} from '../util/commander'

import {
  fail,
  log
} from '../util/process'

import {
  parseOptions,
  reload,
  build
} from '..'

program.usage('<ip>[:<port>] ... [options]')


const options = parse()
const servers = options.args

if (!servers || !servers.length) {
  return fail('no server specified')
}

parseOptions(options)
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

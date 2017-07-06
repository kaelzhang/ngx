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


const options = parse(program => {
  program
  .option('-u, --upstream [upstream]', 'limit the <ip>:<port> matching within specific upstreams. If more than one upstreams are provided, they should be divided with ";"')
})

const servers = options.args
const withinUpstreams = options.upstream

if (!servers || !servers.length) {
  return fail('no server specified')
}

parseOptions(options)
.then(opts => {
  const upstreams = opts.data.upstreams

  if (withinUpstreams) {
    split(withinUpstreams, ',').forEach(name => {
      const upstream = upstreams[name]
      if (!upstream) {
        throw new Error(`upstream "${name}" not found`)
      }

      servers.forEach(server => {
        remove(upstream, server, name)
      })
    })
    return opts
  }

  servers.forEach(server => {
    remove(upstreams, server)
  })

  return opts
})
.then(build)
.then(reload)
.catch(fail)


function remove (upstream, server, upstreamName) {
  const extraMessage = upstreamName
    ? ` from upstream "${upstreamName}"`
    : ''

  const [ip, port] = split(server, ':')

  if (!port) {
    log(`{{cyan remove}} all servers with ip ${ip}${extraMessage}`)
    upstream.remove(ip)
    return
  }

  log(`{{cyan remove}} server ${ip}:${port}${extraMessage}`)
  upstream.remove(ip, port)
}


function split (str, splitter) {
  return str.split(splitter).map(x => x.trim()).filter(Boolean)
}

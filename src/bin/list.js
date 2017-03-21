#!/usr/bin/env node

const {
  parse,
  fail,
  log
} = require('./lib/utils')
const debug = require('debug')('gaia')

const program = parse()

const {
  read_upstreams
} = require('./lib/config')

read_upstreams(true)
.catch(err => {
  log('{{white.bgYellow warn}} fails to read runtime upstreams, fallback to config...')
  log('{{white.bgYellow warn}} which means maybe your nginx server is not started.')
  return read_upstreams()
})
.then(upstreams => {

  program.args.length
    ? list(upstreams, program.args[0])
    : list_all(upstreams)
})


function list_all (upstreams) {
  upstreams.forEach((name, servers) => {
    log('{{cyan name}}', false, {name})

    servers.forEach(({ip, port, enabled}) => {
      if (!enabled) {
        return
      }

      log(`  - ${ip}:${port}`)
    })

    log()
  })
}

function list (upstreams, name) {
  const servers = upstreams[name]

  if (!servers) {
    fail(`upstream "${name}" not found`)
  }

  servers.forEach(({ip, port, enabled}) => {
    if (!enabled) {
      return
    }

    log(`- ${ip}:${port}`)
  })
}

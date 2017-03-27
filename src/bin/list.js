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
  readSavedUpstreams,
  readYaml
} = require('../util/file')

const {
  parseOptions
} = require('..')

parse()

const cwd = program.cwd
const env = program.env

parseOptions({cwd, options: {env}})
.then(({configFile}) => {
  return readSavedUpstreams(cwd)
  .catch(err => {
    log('{{white.bgYellow warn}} fails to read runtime upstreams, fallback to config...')
    log('{{white.bgYellow warn}} which means maybe your nginx server is not started.')
    return readUpstreams(configFile)
  })
})
.then(upstreams => {
  program.args.length
    ? list(upstreams, program.args[0])
    : list_all(upstreams)
})


function readUpstreams (yaml) {
  return readYaml(yaml).then(config => config.upstreams)
}


function list_all (upstreams) {
  upstreams.forEach((name, servers) => {
    log('{{cyan name}}', {name})

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

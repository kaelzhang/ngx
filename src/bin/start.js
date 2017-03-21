#!/usr/bin/env node

const {
  read,
  save_upstreams
} = require('./lib/config')
const _build = require('./lib/build')
const path = require('path')
const command = require('./lib/command')
const spawn = require('./lib/spawn')
const fs = require('fs-promise')

const {
  log
} = require('./lib/utils')

const src = path.join(__dirname, '..', 'src')
const dest = path.join(__dirname, '..', 'nginx')

const build = exports.build = async config => {
  config = config || await read()

  log('{{cyan build}} nginx configurations ...')
  return _build(src, dest, config)
  .then(() => {
    return config
  })
}


function c (type, message) {
  return config => {
    log(message)
    return spawn(...command[type](dest))
    .then(() => config)
  }
}

const test = exports.test = c('test', '{{cyan test}} configurations ...')
const reload = exports.reload = c('reload', '{{cyan reload}} nginx ...')
const stop = exports.stop = c('stop', '{{cyan stop}} nginx ...')
const start = exports.start = c('start', '{{cyan start}} nginx ...')


if (require.main !== module) {
  return
}

const {
  parse,
  fail
} = require('./lib/utils')

parse()

build()
.then(test)
.then(start)
.then(config => {
  return save_upstreams(config.upstreams)
})
.catch(fail)

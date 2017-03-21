#!/usr/bin/env node

const {
  parse,
  fail
} = require('./lib/utils')

const {
  save_upstreams
} = require('./lib/config')

const {
  build,
  test,
  reload
} = require('./start')

parse()

build()
.then(test)
.then(reload)
.then(config => {
  return save_upstreams(config.upstreams)
})
.catch(fail)

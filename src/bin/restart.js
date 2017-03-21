#!/usr/bin/env node

const {
  parse,
  fail
} = require('./lib/utils')

const {
  remove_upstreams,
  save_upstreams
} = require('./lib/config')

const {
  stop,
  build,
  test,
  start
} = require('./start')

parse()

stop()
.then(remove_upstreams)
.then(build)
.then(test)
.then(start)
.then(config => {
  return save_upstreams(config.upstreams)
})
.catch(fail)

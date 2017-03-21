#!/usr/bin/env node

const {
  parse,
  fail
} = require('./lib/utils')

const {
  remove_upstreams
} = require('./lib/config')

const {
  stop
} = require('./start')

parse()

stop().then(remove_upstreams).catch(fail)

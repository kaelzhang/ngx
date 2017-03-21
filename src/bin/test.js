#!/usr/bin/env node

const {
  parse,
  fail
} = require('./lib/utils')

const {
  test
} = require('./start')

parse()

test().catch(fail)

#!/usr/bin/env node

const {
  program,
  parse
} = require('../util/commander')

const {
  fail
} = require('../util/process')

const {
  parseOptions,
  stop
} = require('..')

parse()

const cwd = program.cwd
const env = program.env

parseOptions({cwd, options: {env}})
.then(stop)
.catch(fail)

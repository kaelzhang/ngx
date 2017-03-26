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
  start,
  build
} = require('..')

parse()

const cwd = program.cwd
const env = program.env

parseOptions({cwd, options: {env}})
.then(build)
.then(start)
.catch(fail)

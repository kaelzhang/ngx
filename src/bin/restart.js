#!/usr/bin/env node

import {
  program,
  parse
} from '../util/commander'

import {
  fail
} from '../util/process'

import {
  parseOptions,
  start,
  stop,
  build
} from '..'

parse()

const cwd = program.cwd
const env = program.env

parseOptions({cwd, options: {env}})
.then(stop)
.then(build)
.then(start)
.catch(fail)

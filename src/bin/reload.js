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
  reload,
  build
} from '..'

parse()

const cwd = program.cwd
const env = program.env

parseOptions({cwd, options: {env}})
.then(build)
.then(reload)
.catch(fail)

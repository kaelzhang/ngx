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
  build
} from '..'


parseOptions(parse())
.then(build)
.then(start)
.catch(fail)

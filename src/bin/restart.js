#!/usr/bin/env node

import {
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


parseOptions(parse())
.then(stop)
.then(build)
.then(start)
.catch(fail)

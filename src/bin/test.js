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
  test,
  build
} from '..'


parseOptions(parse())
.then(build)
.then(test)
.catch(fail)

#!/usr/bin/env node

import {
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

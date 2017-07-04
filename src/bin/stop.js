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
  stop
} from '..'


parseOptions(parse())
.then(stop)
.catch(fail)

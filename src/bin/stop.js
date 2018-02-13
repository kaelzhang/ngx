#!/usr/bin/env node

import {
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

#!/usr/bin/env node

import {
  parse
} from '../util/commander'

import {
  fail
} from '../util/process'

import {
  parseOptions,
  build
} from '..'

parseOptions(parse())
.then(build)
.catch(fail)

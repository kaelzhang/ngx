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


parseOptions(parse())
.then(build)
.then(reload)
.catch(fail)

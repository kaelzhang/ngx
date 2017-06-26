#!/usr/bin/env node

import program from 'commander'

program
.version(require('../../package.json').version)
.usage('<cmd> [options]')
.option('-v, --nginx-version', 'show nginx version')
.command('test', 'test nginx config')
.command('reload', 'reload nginx server')
.command('start', 'start nginx server')
.command('stop', 'stop nginx server')
.command('restart', 'restart (stop and start) nginx server')
.command('down <ip>:<port>', 'remove a upstream server')
.command('list [upstream]', 'list all upstreams')
.parse(process.argv)


import {
  spawn,
  fail
} from '../util/process'

if (program.nginxVersion) {
  spawn('nginx', ['-v']).catch(fail)
}

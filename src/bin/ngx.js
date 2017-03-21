#!/usr/bin/env node

const program = require('commander')

program
.version(require('../../package.json').version)
.usage('<cmd>')
.command('test', 'test nginx config')
.command('reload', 'reload nginx server')
.command('start', 'start nginx server')
.command('stop', 'stop nginx server')
.command('restart', 'restart (stop and start) nginx server')
.command('down <ip>:<port>', 'remove a upstream server')
.command('list [upstream]', 'list all upstreams')
.parse(process.argv)

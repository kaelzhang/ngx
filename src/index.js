const build = require('./builder')

const save = opts => saveUpstreams(opts.dest, opts.data.upstreams)
const remove = opts => removeSavedUpstreams(opts.dest)

const test = c('test', '{{cyan test}} configurations ...')
const reload = c('reload', '{{cyan reload}} nginx ...', save)
const stop = c('stop', '{{cyan stop}} nginx ...', remove)
const start = c('start', '{{cyan start}} nginx ...', save)

module.exports = {
  parseOptions,
  build,
  test,
  reload,
  start,
  stop
}


const path = require('path')
const command = require('./nginx-command')
const OptionManager = require('./option-manager')
const {
  readYaml,
  saveUpstreams,
  removeSavedUpstreams
} = require('./util/file')
const {
  spawn,
  log
} = require('./util/process')


async function parseOptions ({
  cwd, options
}) {

  const {
    src,
    dest,
    configFile,
    entry
  } = await new OptionManager({
    cwd,
    options
  }).get()

  const data = await readYaml(configFile)

  return {
    src,
    dest,
    data,
    configFile,
    entry
  }
}


function c (type, message, after) {
  return async opts => {
    log(message)

    const {
      dest,
      entry
    } = opts

    await spawn(...command[type](dest, entry))

    if (after) {
      await after(opts)
    }

    return opts
  }
}

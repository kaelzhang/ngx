import build from './builder'

const save = opts => saveUpstreams(opts.dest, opts.data.upstreams)
const remove = opts => removeSavedUpstreams(opts.dest)

export const test = c('test', '{{cyan test}} configurations ...')
export const reload = c('reload', '{{cyan reload}} nginx ...', save)
export const stop = c('stop', '{{cyan stop}} nginx ...', remove)
export const start = c('start', '{{cyan start}} nginx ...', save)
export {build}


import path from 'path'
import command from './nginx-command'
import OptionManager from './option-manager'
import {
  readYaml,
  saveUpstreams,
  removeSavedUpstreams
} from './util/file'
import {
  spawn,
  log
} from './util/process'


export async function parseOptions ({
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

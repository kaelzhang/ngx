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
  cwd,
  env: optionEnv,
  user,
  group
}) {

  const {
    src,
    dest,
    preset,
    entry,
    env
  } = await new OptionManager({
    cwd,
    env: optionEnv
  }).get()

  const data = await readYaml(preset)

  if (!data.user && !user) {
    const error = new Error(
`user must be defined to prevent further problems, you can specify it either:
  - with cli option "--user <user>:<group>"
  - or in preset file`)
    return Promise.reject(error)
  }

  // cli user has higher priority
  if (user) {
    data.user = `${user} ${group}`
  }

  data.env = env

  return {
    src,
    dest,
    data,
    preset,
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

import yaml from 'js-yaml'
import fs from 'fs-promise'
import path from 'path'
import code from 'code-stringify'
import {
  Upstreams
} from '../entity/upstream'

import {
  Servers
} from '../entity/server'


export function readYaml (filepath) {
  const base = path.basename(filepath)

  return readFile(filepath)
  .then(parseYaml)
  .then(config => {
    config.upstreams = new Upstreams(config.upstreams)
    config.servers = new Servers(cleanServers(config.servers), {base})

    return config
  })
}


// TODO
function cleanServers (servers, filepath) {
  // resolve server.include
  return servers
}


async function parseYaml (content) {
  return yaml.safeLoad(content)
}


export function readFile (filepath) {
  return fs.readFile(filepath)
  .then(content => {
    return content.toString()
  })
  .catch(err => {
    const error = new Error(`fails to read "${filepath}", ${err.stack}`)
    // make sure the original error.code
    error.code = err.code
    return Promise.reject(error)
  })
}


// abc.conf, abcde -> abc-abcde.conf
const REGEX_EXT = /\.[a-z0-9]+(?:$|\?)/
export function decorate (basename, hash) {
  return basename.replace(REGEX_EXT, ext => '-' + hash.slice(0, 10) + ext)
}


const SEMICOLON = ';'
export function handleSemicolon (fn) {
  return async p => {
    const lastIndex = p.lastIndexOf(SEMICOLON)
    const has = lastIndex === p.length - 1

    // removes the last semicolon
    if (has) {
      p = p.substr(0, lastIndex)
    }

    const result = await fn(p)
    return has
      ? result
        // {{root /path/to;}} -> root /path/to;
        ? result + SEMICOLON
        // {{root /path/to}}  -> ''
        // avoid to output an unnecessary `;`
        : ''

      // {{root /path/to}}    -> root /path/to
      : result
  }
}


export async function readSavedUpstreams (dir) {
  const upstreams = require(upstreamFile(dir))

  Object.defineProperty(upstreams, 'forEach', {
    value: (fn) => {
      Object.keys(upstreams).forEach((name) => {
        fn(name, upstreams[name])
      })
    },
    enumerable: false
  })

  return upstreams
}


function upstreamFile (dir) {
  return path.join(dir, '.ngx', 'upstream.js')
}


export function saveUpstreams (dir, upstreams) {
  const us = {}
  upstreams.forEach((name, servers) => {
    us[name] = servers
  })

  return fs.outputFile(upstreamFile(dir),
    `module.exports = ${code(us, null, 2)}`)
}


export function removeSavedUpstreams (dir) {
  return fs.unlink(upstreamFile(dir))
}

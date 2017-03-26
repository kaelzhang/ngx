module.exports = {
  readYaml,
  readFile,
  decorate,
  handleSemicolon,
  readSavedUpstreams,
  saveUpstreams,
  removeSavedUpstreams
}


const yaml = require('js-yaml')
const fs = require('fs-promise')
const path = require('path')
const code = require('code-stringify')
const {
  Upstreams
} = require('../entity/upstream')

const {
  Servers
} = require('../entity/server')


function readYaml (filepath) {
  const base = path.basename(filepath)

  return readFile(filepath)
  .then(parseYaml)
  .then(config => {
    config.upstreams = new Upstreams(config.upstream)
    config.servers = new Servers(cleanServers(config.server), {base})

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


function readFile (filepath) {
  return fs.readFile(filepath)
  .then(content => {
    return content.toString()
  })
  .catch(err => {
    const error = new Error(`fails to read "${filepath}", ${err.stack}`)
    return Promise.reject(error)
  })
}


const REGEX_EXT = /\.[a-z0-9]+(?:$|\?)/
function decorate (basename, hash) {
  return basename.replace(REGEX_EXT, ext => '-' + hash.slice(0, 10) + ext)
}


const SEMICOLON = ';'
function handleSemicolon (fn) {
  return async p => {
    const lastIndex = p.lastIndexOf(SEMICOLON)
    const has = lastIndex === p.length - 1

    if (has) {
      p = p.substr(0, lastIndex)
    }

    const result = await fn(p)
    return has
      ? result
        ? result + SEMICOLON
        : ''
      : result
  }
}


async function readSavedUpstreams (cwd) {
  const upstreams = require(upstreamFile(cwd))

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


function upstreamFile (cwd) {
  return path.join(cwd, '.ngx', 'upstream.js')
}


function saveUpstreams (cwd, upstreams) {
  const us = {}
  upstreams.forEach((name, servers) => {
    us[name] = servers
  })

  return fs.outputFile(upstreamFile(cwd),
    `module.exports = ${code(us, null, 2)}`)
}


function removeSavedUpstreams (cwd) {
  return fs.unlink(upstreamFile(cwd))
}

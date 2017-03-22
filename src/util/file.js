module.exports = {
  readYaml,
  readFile,
  decorate,
  handleSemicolon
}


const yaml = require('js-yaml')
const fs = require('fs-promise')
const path = require('path')
const {
  Upstreams
} = require('./entity/upstream')

const {
  Servers
} = require('./entity/server')


function readYaml (filepath) {
  const base = path.basename(filepath)

  return readFile(filepath)
  .then(parseYaml)
  .then(config => {
    config.upstreams = new Upstreams(config.upstream)
    config.servers = new Servers(config.server, {base})

    return config
  })
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
  return basename.replace(REGEX_EXT, ext => '-' + hash + ext)
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
      ? result + SEMICOLON
      : result
  }
}

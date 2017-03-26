module.exports = build

const {
  readFile
} = require('./util/file')
const Compiler = require('./compiler')
const path = require('path')
const fs = require('fs-promise')

async function build ({
  // @param {path} src Absolute url
  src,
  // @param {path} dest Absolute url
  dest,
  // @param {Object} the content of config.yaml
  data: config,
  // @param {path} entry the entry file of nginx, relative to src
  entry
}) {

  const absEntry = path.join(src, entry)
  const entryContent = await readFile(absEntry)

  const servers = []
  const includeServer = async server => {
    const data = {
      ...config
    }

    Object.assign(data, server.data)

    const compiler = new Compiler({
      src,
      dest,
      data,
      file: entry
    })

    const result = await server.toString(compiler.include)
    servers.push(result)
  }

  await Promise.all(
    config.servers.map(includeServer)
  )

  const data = {
    ...config,
    servers: servers.join('\n\n')
  }

  // Ensure dir "logs" which is required by nginx by default
  await fs.ensureDir(path.join(dest, 'logs'))

  await new Compiler({
    src,
    dest,
    data,
    file: entry,
    isEntry: true
  }).transform()

  return {
    src,
    dest,
    data,
    entry
  }
}

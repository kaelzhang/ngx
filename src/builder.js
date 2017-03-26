module.exports = build

const {
  readFile
} = require('./util/file')
const Compiler = require('./compiler')
const path = require('path')

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

  const entryContent = await readFile(entry)
  const relativeEntry = path.relative(src, entry)

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
      file: relativeEntry
    })

    const result = await server.toString(compiler.include)
    servers.push(result)
  }

  await Promise.all(
    config.servers.map(includeServer)
  )

  const data = {
    ...config,
    servers
  }

  const {
    destpath
  } = await new Compiler({
    src,
    dest,
    data,
    file: relativeEntry,
    isEntry: true
  }).transform()

  return {
    src,
    dest,
    data,
    destEntry: destpath
  }
}

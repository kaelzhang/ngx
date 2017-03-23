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
  config,
  // @param {path} entry the entry file of nginx, relative to src
  entry
}) {

  const entryContent = await readFile(entry)
  const relativeEntry = path.relative(src, entry)

  const subCompiler = new Compiler({
    src,
    dest,
    data: config,
    file: relativeEntry
  })

  const data = {
    ...config
  }

  //
  data.servers = await config.servers.toString(subCompiler.include)

  await new Compiler({
    src,
    dest,
    data,
    file: relativeEntry
  }).transform()

  return data
}

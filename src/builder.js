import {
  readFile
} from './util/file'
import Compiler from './compiler'
import path from 'path'
import fs from 'fs-promise'

export default async function build ({
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

    return await server.toString(compiler.include)
  }

  const servers = await Promise.all(
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

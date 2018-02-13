import {
  readFile
} from './util/file'
import Compiler from './compiler'
import path from 'path'
import fs from 'fs-extra'

export default async function build ({
  // @param {path} src Absolute url
  src,
  // @param {path} dest Absolute url
  dest,
  // @param {Object} the content of config.yaml
  data: config,
  // @param {path} entry the entry file of nginx, relative to src
  entry,
  // @param {function(path)} map a filepath according to volumes
  map
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
      file: entry,
      map
    })

    return await server.toString(compiler.directives.include)
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
    map,
    isEntry: true
  }).transform()

  return {
    src,
    dest,
    data,
    entry
  }
}

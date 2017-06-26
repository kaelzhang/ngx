import test from 'ava'
import build from '../lib/builder'
import {
  readYaml
} from '../lib/util/file'
import path from 'path'
import fs from 'fs-extra'


function fixture (p) {
  return path.join(__dirname, p)
}

test('builder', async t => {
  const src = fixture('src')
  const dest = fixture('nginx')
  const entry = fixture('src/nginx.conf')

  const configFile = fixture('preset/production.yml')
  const config = await readYaml(configFile)

  return build({
    src,
    dest,
    entry,
    data: config
  })
})

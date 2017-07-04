import test from 'ava'
import build from '../lib/builder'
import {
  readYaml
} from '../lib/util/file'
import path from 'path'
import fs from 'fs-extra'


function fixture (p) {
  return path.join(__dirname, 'normal', p)
}

test('builder', async t => {
  const src = fixture('src')
  const dest = fixture('nginx')
  const entry = 'nginx.conf'

  const configFile = fixture('preset/production.yml')
  const config = await readYaml(configFile)

  return build({
    src,
    dest,
    entry,
    data: config
  })
})

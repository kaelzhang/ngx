const test = require('ava')
const build = require('../lib/builder')
const {
  readYaml
} = require('../lib/util/file')
const path = require('path')


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
    config
  })
})

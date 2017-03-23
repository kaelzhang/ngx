module.exports = {
  build,

}

const {
  readYaml,
} = require('./util/file')

const _build = require('./lib/build')
const path = require('path')
const command = require('./lib/command')
const spawn = require('./lib/spawn')
const fs = require('fs-promise')

const _test = c('test', '{{cyan test}} configurations ...')
const _reload = c('reload', '{{cyan reload}} nginx ...')
const _stop = c('stop', '{{cyan stop}} nginx ...')
const _start = c('start', '{{cyan start}} nginx ...')


// function options ({
//   cwd,
//   options
// }) {

// }


async function build ({
  src,
  dest,
  configFile
}) {

  const config = await readYaml(configFile)

}



const build = exports.build = async config => {
  config = config || await read()

  log('{{cyan build}} nginx configurations ...')
  return _build(src, dest, config)
  .then(() => {
    return config
  })
}


function c (type, message) {
  return config => {
    log(message)
    return spawn(...command[type](dest))
    .then(() => config)
  }
}




if (require.main !== module) {
  return
}

const {
  parse,
  fail
} = require('./lib/utils')

parse()

build()
.then(test)
.then(start)
.then(config => {
  return save_upstreams(config.upstreams)
})
.catch(fail)

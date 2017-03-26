const json = require('json5')
const path = require('path')
const {
  readFile
} = require('./util/file')


module.exports = class OptionManager {
  constructor ({
    cwd,

    // cli options, including
    // - env `String` NGX_ENV
    options
  }) {
    this._cwd = path.resolve(cwd)
    this._options = options

    this._env = options.env || process.env.NGX_ENV
  }

  async _readNgxrc () {
    const rc = path.join(this._cwd, '.ngxrc')
    const content = await readFile(rc)
    return {
      value: json.parse(content),
      filepath: rc,
      type: 'rc'
    }
  }

  _readNgxrcJs () {
    const rcjs = path.join(this._cwd, '.ngxrc.js')
    return {
      value: require(rcjs),
      filepath: rcjs,
      type: 'js'
    }
  }

  _readPackage () {
    const packageJson = path.join(this._cwd, 'package.json')
    const pkg = require(packageJson)

    if (!pkg.ngx) {
      return
    }

    return {
      value: pkg.ngx,
      filepath: packageJson,
      type: 'package'
    }
  }

  async _read () {
    try {
      return await this._readNgxrc()
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e
      }
    }

    try {
      return await this._readNgxrcJs()
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw e
      }
    }

    try {
      return await this._readPackage()
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw e
      }
    }
  }

  async get () {
    const {
      value: config
    } = await this._read()
    const cli = this._options

    const src = cli.src || config.src
    if (!src) {
      return Promise.reject(new Error('src is not defined'))
    }

    const dest = cli.dest || config.src
    if (!dest) {
      return Promise.reject(new Error('dest is not defined'))
    }

    const configFile = this._configFile(config)
    if (!configFile) {
      return Promise.reject(new Error('configFile is not defined'))
    }

    const entry = cli.entry || config.entry
    if (!entry) {
      return Promise.reject(new Error('entry is not defined'))
    }

    return {
      src: this._resolve(src),
      dest: this._resolve(dest),
      configFile,
      entry: this._resolve(entry)
    }
  }

  _resolve (p) {
    return path.resolve(this._cwd, p)
  }

  _configFile (config) {
    let configFile = this._options.config

    if (configFile) {
      return configFile
    }

    configFile = config.configFile

    if (Object(configFile) === configFile) {
      configFile = configFile[this._env]
    }

    return path.resolve(this._cwd, configFile)
  }
}

const json = require('json5')
const path = require('path')
const {
  read
} = require('./util/file')


class OptionManager {
  constructor ({
    cwd,
    cliOptions
  }) {
    this._cwd = path.resolve(cwd)
    this._cliOptions = cliOptions

    this._env = cliOptions.env || process.env.NGX_ENV
  }

  async _readNgxrc () {
    const rc = path.join(this._cwd, '.ngxrc')
    const content = await read(rc)
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
    const options = await this._read()
    const cli = this._cliOptions

    const src = cli.src || options.src
    if (!src) {
      return Promise.reject(new Error('src is not defined'))
    }

    const dest = cli.dest || options.src
    if (!dest) {
      return Promise.reject(new Error('dest is not defined'))
    }

    const config = this._config()
    if (!config) {
      return Promise.reject(new Error('config is not defined'))
    }

    return {
      src: path.resolve(src),
      dest: path.resolve(dest),
      config
    }
  }

  _config (options) {
    let config = options.config
    if (Object(config) === config) {
      config = config[this._env]
    } else {
      config = this._cliOptions.config
    }

    return config
  }
}

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

    }
  }
}

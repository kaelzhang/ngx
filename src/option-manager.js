import json from 'json5'
import path from 'path'
import {
  readFile
} from './util/file'


module.exports = class OptionManager {
  constructor ({
    cwd,

    // `String=` NGX_ENV
    env
  }) {

    this.cwd = path.resolve(cwd)
    this.env = env || process.env.NGX_ENV
  }

  async _readNgxrc () {
    const rc = path.join(this.cwd, '.ngxrc')
    const content = await readFile(rc)
    return {
      value: json.parse(content),
      filepath: rc,
      type: 'rc'
    }
  }

  _readNgxrcJs () {
    const rcjs = path.join(this.cwd, '.ngxrc.js')
    return {
      value: require(rcjs),
      filepath: rcjs,
      type: 'js'
    }
  }

  _readPackage () {
    const packageJson = path.join(this.cwd, 'package.json')
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

    throw new Error('.ngxrc not found')
  }

  async get () {
    const {
      value: rc,
      filepath
    } = await this._read()

    this._rc = rc
    this._rcBase = path.dirname(filepath)

    const preset = this._presetFile()
    const src = this._resolve('src')
    const dest = this._resolve('dest')
    const entry = this._resolve('entry')

    const relativeEntry = path.relative(src, entry)
    if (relativeEntry.indexOf('..') === 0) {
      return Promise.reject(new Error('entry should inside directory `src`'))
    }

    return {
      // `path` absolute path, the unbuilt source files
      src,
      // `path` absolute path, the directory to build dest files into
      dest,
      // `path` absolute path of the yaml configuration file
      preset,

      // `path` relative path to `src`
      // suppose
      // - src: foo
      // - entry: foo/nginx.conf
      // -> entry: nginx.conf
      entry: relativeEntry
    }
  }

  // Resolve a key from rc
  // - rc: resolve with rcPath
  _resolve (key) {
    const rc = this._rc

    if (key in rc) {
      return path.resolve(this._rcBase, rc[key])
    }

    throw new Error(`${key} is not defined`)
  }

  _presetFile () {
    let preset = this._rc.preset

    if (!preset) {
      throw new Error('preset is not defined')
    }

    if (Object(preset) === preset) {
      preset = preset[this.env]

      if (!preset) {
        throw new Error(`preset for env "${this.env}" is not defined in ".ngxrc"`)
      }
    }

    return path.resolve(this._rcBase, preset)
  }
}

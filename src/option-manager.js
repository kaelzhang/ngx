import json from 'json5'
import path from 'path'
import {
  readFile
} from './util/file'


module.exports = class OptionManager {
  constructor ({
    cwd,

    // cli options, including
    // - env `String=` NGX_ENV
    // - src `path=` will override rc.src
    // - dest `path=` will override rc.dest
    // - preset `path=` will override rc.preset
    // - entry `path=` will override rc.entry
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
      value: rc
      filepath
    } = await this._read()
    const cli = this._options

    this._rc = rc
    this._rcPath = filepath

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

      entry: relativeEntry
    }
  }

  // Resolve a key from cli or rc
  // - cli: resolve with cwd
  // - rc: resolve with rcPath
  // Priority
  // cli > rc
  _resolve (key) {
    const cli = this._options
    const rc = this._rc

    if (key in cli) {
      return path.resolve(this._cwd, cli[key])
    }

    if (key in rc) {
      return path.resolve(this._rcPath, rc[key])
    }

    throw new Error(`${key} is not defined`)
  }

  _presetFile () {
    let preset = this._options.preset

    if (preset) {
      return path.resolve(this._cwd, preset)
    }

    preset = this._rc.preset

    if (!preset) {
      throw new Error('preset is not defined')
    }

    if (Object(preset) === preset) {
      preset = preset[this._env]

      if (!preset) {
        throw new Error(`preset for env "${this._env}" is not defined in ".ngxrc"`)
      }
    }

    return path.resolve(this._rcPath, preset)
  }
}

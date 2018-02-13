import json from 'json5'
import path from 'path'
import {
  readFile
} from './util/file'
import {
  removeEnding
} from 'pre-suf'

const DEFAULT_ENV = 'production'


module.exports = class OptionManager {
  constructor ({
    cwd,

    // `String=` NGX_ENV
    env
  }) {

    this.cwd = path.resolve(cwd)
    this.env = env || process.env.NGX_ENV || DEFAULT_ENV
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

    const volumes = this._parseVolumes()
    const {
      map
    } = new Mapper(volumes)

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
      entry: relativeEntry,
      env: this.env,
      map
    }
  }

  _parseVolumes () {
    const {volumes} = this._rc
    if (!volumes) {
      return {}
    }

    const real = Object.create(null)
    Object.keys(volumes).forEach(from => {
      real[this._resolveToBase(from)] = removeEnding(volumes[from], '/')
    })

    return real
  }

  // Resolve a key from rc
  // - rc: resolve with rcPath
  _resolve (key) {
    const rc = this._rc

    if (key in rc) {
      return this._resolveToBase(rc[key])
    }

    throw new Error(`${key} is not defined`)
  }

  _resolveToBase (filepath) {
    const resolved = path.resolve(this._rcBase, filepath)
    return removeEnding(resolved, '/')
  }

  _presetFile () {
    let {preset} = this._rc

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

const justReturn = x => x

class Mapper {
  constructor (mapper) {
    this._mapper = mapper
    this._paths = Object.keys(mapper)

    this.map = !this._paths.length
      ? justReturn
      : this.map.bind(this)
  }

  map (path) {
    const index = this._paths.findIndex(from => {
      if (path.indexOf(from) === 0) {
        return true
      }
    })

    if (!~index) {
      return path
    }

    const from = this._paths[index]
    return this._mapper[from] + path.slice(from.length)
  }
}

const typo = require('typo')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs-promise')
const isGlob = require('is-glob')
const globby = require('globby')
const {
  readFile,
  decorate,
  handleSemicolon
} = require('./util/file')


module.exports = class Compiler {
  constructor ({
    data = {},
    file,
    dest,
    src,
    isEntry
  }) {

    this._data = data
    this._src = src
    this._dest = dest
    this._isEntry = isEntry

    this._file = file
    this._filepath = path.join(src, file)
    this._destpath = path.join(dest, file)

    this._srcbase = path.dirname(this._filepath)
    this._destbase = path.dirname(this._destpath)

    this._createCompiler()
  }

  _createCompiler () {
    const directive = {}

    const methods = 'root include pid error_log user'.split(' ')

    const impls = [
      this._directive('root'),
      p => this._include(p),
      this._ensure('pid'),
      this._ensure('error_log'),
      p => this._user(p),

    ].map(handleSemicolon)

    methods
    .forEach((name, i) => {
      this[name] = directive[name] = impls[i]
    })

    this._typo = typo()
    .use(directive)
  }

  _resolve (p) {
    const abs = path.join(this._srcbase, p)
    const relative = path.relative(this._src, abs)
    const inside = relative.indexOf('..') !== 0

    return {
      inside,

      // absolute path
      destpath: inside
        ? path.join(this._destbase, p)
        : abs,

      // relative path to src
      file: inside
        ? relative
        : undefined,
    }
  }

  _directive (name) {
    return async p => `${name} ${this._resolve(p).destpath}`
  }

  _ensure (name) {
    return async p => {
      const {
        destpath
      } = this._resolve(p)

      const dir = path.dirname(destpath)
      await fs.ensureDir(dir)
      return `${name} ${destpath}`
    }
  }

  async _include (p) {
    const {
      file,
      destpath,
      inside
    } = this._resolve(p)

    // If is outside the src, then use its own address
    if (!inside) {
      return `include ${destpath}`
    }

    if (!isGlob(file)) {
      return this._includeOne(file)
    }

    return this._includeMany(file)
  }

  _cleanData (data) {
    if (data._ngx) {
      return data
    }

    const cleaned = {
      ...data
    }

    Object.defineProperties(cleaned, {
      upstreams: {
        get () {
          throw new Error(
            `{{upstreams}} is not allowed in non-entry files, "${file}"`)
        }
      },

      servers: {
        get () {
          throw new Error(
            `{{servers}} is not allowed in non-entry files, "${file}"`)
        }
      },

      _ngx: {
        value: true
      }
    })

    return cleaned
  }

  async _includeOne (file) {
    const data = this._cleanData(this._data)

    // Or we should use the new compiled file
    const {
      destpath: compiledDest
    } = await new Compiler({
      data,
      file,
      dest: this._dest,
      src: this._src
    }).transform()

    return `include ${compiledDest}`
  }

  async _includeMany (file) {
    const files = await globby(file, {
      cwd: this._src
    })

    return Promise.all(files.map(file => this._includeOne(file)))
    .then(results => {
      return results.join(';\n')
    })
  }

  async _user (user) {
    // Only show in sudo
    return this._data.sudo === false
      ? ''
      : `user ${user}`
  }

  async transform () {
    const compiled = await this._template()

    const hash = crypto.createHash('sha256')
      .update(compiled).digest('hex')

    const destpath = this._isEntry
      ? this._destpath
      : decorate(this._destpath, hash)

    await fs.outputFile(destpath, compiled)

    return {
      destpath
    }
  }

  _template () {
    const file = this._filepath

    return readFile(file)
    .then(content => {
      return this._typo.template(
      content, this._data, {
        value_not_defined: 'throw',
        directive_value_not_defined: 'print'
      })
    })
    .catch(err => {
      err.message += `\n\nat file "${file}"\n`
      return Promise.reject(err)
    })
  }
}

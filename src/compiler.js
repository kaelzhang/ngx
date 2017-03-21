const typo = require('typo')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs-promise')
const {
  readFile,
  decorate,
  handleSemicolon
} = require('../util/file')


class Compiler {
  constructor ({
    data,
    file,
    dest,
    src,
    options
  }) {

    this._data = data
    this._src = src
    this._dest = dest

    this._file = file
    this._filepath = path.join(src, file)
    this._destpath = path.join(dest, file)

    this._srcbase = path.dirname(this._filepath)
    this._destbase = path.dirname(this._destpath)

    this._options = options

    this._createCompiler()
  }

  _createCompiler () {
    const [
      root,
      include,
      pid,
      error_log,
      user
    ] = [

      this._directive('root'),
      p => this._include(p),
      this._ensure('pid'),
      this._ensure('error_log'),
      p => this._user(p),

    ].map(handleSemicolon)

    this._typo = typo()
    .use({
      root,
      include,
      pid,
      error_log,
      user
    })
  }

  _resolve (p) {
    const abs = path.join(this._srcbase, p)
    const relative = path.relative(this._src, abs)
    const inside = relative.indexf('..') !== 0

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

    // Or we should use the new compiled file
    const {
      destpath: compiledDest
    } = await new Compiler({
      data: this._data,
      file,
      dest: this._dest,
      src: this._src,
      options, this._options
    }).transform()

    return `include ${compiledDest}`
  }

  async _user (user) {
    // Only show in sudo
    return this._options.sudo === false
      ? ''
      : `user ${user}`
  }

  async transform () {
    const content = await readFile(this._filepath)
    const compiled = await this._typo.template(
      content.toString(), {}, {
        value_not_defined: 'throw',
        directive_value_not_defined: 'print'
      })

    const hash = crypto.createHash('sha256')
      .update(compiled).digest()

    const destpath = decorate(this._destpath, hash)
    await fs.outputFile(destpath, compiled)

    return {
      destpath
    }
  }
}

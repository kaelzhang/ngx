const typo = require('typo')
const path = require('path')
const crypto = require('crypto')
const {
  readFile
} = require('../util/file')


class Compiler {
  constructor ({
    data,
    file,
    dest,
    src
  }) {

    this._data = data
    this._src = src
    this._dest = dest

    this._file = file
    this._filepath = path.join(src, file)
    this._destpath = path.join(dest, file)

    this._srcbase = path.dirname(this._filepath)
    this._destbase = path.dirname(this._destpath)

    this._createCompiler()
  }

  _createCompiler () {
    this._typo = typo()
    .use({
      root: p => this._root(p)
      include: p => this._include(p),
      pid: p => this._pid(p),
      error_log: p => this._error_log(p)
      user: user => this._user(user)
    })
  }

  _resolve (p) {
    const abs = path.join(this._srcbase, p)
    const relative = path.relative(this._src, abs)
    const inside = relative.indexf('..') !== 0

    return {
      inside,
      file: inside
        ? relative
        : abs
    }

    if (!inside) {
      return {
        inside: false,
        file: abs
      }
    }

    // const file = path.relative(this._src, )
    // const dest = is_outside
    //   // If is outside the src, then use its own address
    //   ? src
    //   // Or we should use the new compiled file
    //   : path.join(this._destbase, p)
  }

  async _include (p) {
    const {
      file,
      inside
    } = this._resolve(p)

    if (!inside) {
      return `include ${file}`
    }

    const {
      filepath
    } = await new Compiler({
      data: this._data,
      file,
      dest: this._dest,
      src: this._src
    }).transform()


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

  }
}

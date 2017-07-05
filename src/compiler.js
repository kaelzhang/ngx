import typo from 'typo'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs-extra'
import isGlob from 'is-glob'
import globby from 'globby'
import {
  readFile,
  decorate,
  handleSemicolon
} from './util/file'

const NGX = Symbol('ngx-cleaned')

export default class Compiler {
  constructor ({
    // `Object` data to be substitute
    data = {},
    // `path` relative path of the file to be compiled
    file,
    // `path` rc.dest
    dest,
    // `path` rc.src
    src,
    // `Boolean` whether the file is rc.entry
    isEntry
  }) {

    this.data = data
    this.src = src
    this.dest = dest
    this.isEntry = isEntry

    this.file = file
    this.filepath = path.join(src, file)
    this.destpath = path.join(dest, file)

    this.filebase = path.dirname(this.filepath)
    this.destFilebase = path.dirname(this.destpath)

    this.directives = Object.create(null)

    this.includes = []

    this._createCompiler()
  }

  _createCompiler () {
    const directives = this.directives

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
      directives[name] = impls[i]
    })

    this._typo = typo()
    .use(directives)
  }

  _resolve (p) {
    const abs = path.join(this.filebase, p)
    const relative = path.relative(this.src, abs)
    const inside = relative.indexOf('..') !== 0

    return {
      // `Boolean` whether inside the src
      inside,

      // `path` absolute path of the file to be written to
      destpath: inside
        ? path.join(this.destFilebase, p)
        : abs,

      // `path` relative path to src
      file: inside
        ? relative
        : undefined
    }
  }

  // @returns `function` the helper function to handle paths
  _directive (name) {
    return async p => `${name} ${this._resolve(p).destpath}`
  }

  // @returns `function` the helper function to handle paths and
  // ensures directory
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

  // @returns `function`
  // - recursively compile included files
  // - handle glob stars
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

  // Do not allow to use upstreams and servers in non-entry file
  _cleanData (data) {
    if (data[NGX]) {
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

      [NGX]: {
        value: true
      }
    })

    return cleaned
  }

  async _includeOne (file) {
    const data = this._cleanData(this.data)

    const sub = new Compiler({
      data,
      file,
      dest: this.dest,
      src: this.src
    })
    this.includes.push(sub)

    // Or we should use the new compiled file
    const {
      destpath: compiledDest
    } = await sub.transform()

    return `include ${compiledDest}`
  }

  async _includeMany (file) {
    const files = await globby(file, {
      cwd: this.src
    })

    return Promise.all(files.map(file => this._includeOne(file)))
    .then(results => {
      return results.join(';\n')
    })
  }

  async _user (user) {
    return `user ${user}`
  }

  async transform () {
    const compiled = await this._template()

    const hash = crypto.createHash('sha256')
      .update(compiled).digest('hex')

    const destpath = this.isEntry
      ? this.destpath
      : decorate(this.destpath, hash)

    await fs.outputFile(destpath, compiled)

    return {
      destpath
    }
  }

  _template () {
    return readFile(this.filepath)
    .then(content => {
      return this._typo.template(content, this.data, {
        value_not_defined: 'throw',
        directive_value_not_defined: 'print'
      })
    })
  }
}

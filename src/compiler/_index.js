module.exports = compile

const Typo = require('typo')
const path = require('path')
const fs = require('fs-promise')


function compile ({
  src,
  dest,
  file,
  source
}) {

  const filepath = path.join(src, file)
  const destpath = path.join(dest, file)

  const srcbase = path.dirname(filepath)
  const destbase = path.dirname(destpath)

  const resolve = p => {
    const abs = path.join(srcbase, p)
    const is_outside = path.relative(src, abs).indexOf('..') === 0

    // If is outside the src, then use its own address
    if (is_outside) {
      return abs
    }

    // Or we should use the new compiled file
    return path.join(destbase, p)
  }

  const directive = name => {
    return p => `${name} ${resolve(p)}`
  }

  const ensure = (name) => {
    return p => {
      p = resolve(p)

      const dir = path.dirname(p)

      return fs.ensureDir(dir)
      .then(() => {
        return `${name} ${p}`
      })
    }
  }

  const typo = Typo()
  .use({
    root: directive('root'),
    include: directive('include'),
    pid: ensure('pid'),
    error_log: ensure('error_log'),
    user (user) {
      // Only show in production
      return process.env.GAIA_ENV !== 'local'
        ? `user ${user}`
        : ''
    }
  })

  return typo.compile(source, {
    value_not_defined: 'throw',
    directive_value_not_defined: 'print'
  })
}

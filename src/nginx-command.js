import path from 'path'

// @param {path} dest
function nginx (dest, entry, rest = []) {
  return ['nginx', ['-p', dest, '-c', path.join(dest, entry), ...rest]]
}

export function reload (dest, entry) {
  return nginx(dest, entry, ['-s', 'reload'])
}

export function stop (dest, entry) {
  return nginx(dest, entry, ['-s', 'stop'])
}

export function test (dest, entry) {
  return nginx(dest, entry, ['-t'])
}

export function start (dest, entry) {
  return nginx(dest, entry)
}

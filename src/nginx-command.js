import path from 'path'

export default {
  reload,
  stop,
  test,
  start
}


// @param {path} dest
function nginx (dest, entry, rest = []) {
  return ['nginx', ['-p', dest, '-c', path.join(dest, entry), ...rest]]
}

function reload (dest, entry) {
  return nginx(dest, entry, ['-s', 'reload'])
}

function stop (dest, entry) {
  return nginx(dest, entry, ['-s', 'stop'])
}

function test (dest, entry) {
  return nginx(dest, entry, ['-t'])
}

function start (dest, entry) {
  return nginx(dest, entry)
}

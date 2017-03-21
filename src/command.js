module.exports = {
  start: nginx,
  reload,
  stop,
  test
}


// @param {path} dest
function nginx (dest, rest = []) {
  return ['nginx', ['-p', dest, '-c', `${dest}/nginx.conf`, ...rest]]
}

function reload (dest) {
  return nginx(dest, ['-s', 'reload'])
}

function stop (dest) {
  return nginx(dest, ['-s', 'stop'])
}

function test (dest) {
  return nginx(dest, ['-t'])
}

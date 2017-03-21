async function a () {
  return 1
}

async function b () {
  return await a()
}

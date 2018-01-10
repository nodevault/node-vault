// file: example/secret_mounts.js

process.env.DEBUG = 'node-vault' // switch on debug mode

const vault = require('./../src/main')()

const example = async (vault) => {
  await vault.mounts()
  await vault.mount({ mount_point: 'test', type: 'generic', description: 'just a test' })
  await vault.write('test/hello', { value: 'world', lease: '1s' })
  await vault.remount({ from: 'test', to: 'test2' })
  console.log(await vault.read('test2/hello'))
  await vault.unmount({ mount_point: 'test2' })
}

module.exports = example

if (require.main === module) example(vault).catch(console.error)

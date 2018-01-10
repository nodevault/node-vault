const fs = require('fs-extra')
const init = require('./init')
const vault = require('../src/main')()

const runExamples = async (examples, vault) => {
  if (!examples.length) return
  const nextExample = examples.shift()
  console.log('\n\n\n')
  await nextExample(vault).catch(console.error)
  await runExamples(examples, vault)
}

const run = async () => {
  const files = await fs.readdir(__dirname)
  const examples = files
    .filter(file =>
      file !== 'all.js' &&
      file !== 'init.js' &&
      file.endsWith('.js'))
    .map(file => require(`${__dirname}/${file}`))

  console.log('Running all node-vault examples...')

  let initData
  try {
    initData = await init(vault)
  } catch (err) {
    console.error(err)
  }

  await runExamples(examples, vault)
  initData &&
    console.log(`\n\n\nSet this variable to run more examples in the future:

      export VAULT_TOKEN='${initData.root_token}'`)
}

run().catch(console.error)

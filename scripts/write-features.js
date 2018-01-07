const fs = require('fs')
const features = require('../src/features')

const result = Object.keys(features).map(name => {
  const feature = features[name]

  return `
## vault.${name}

\`${feature.method} ${feature.path}\`
`
})

result.unshift(`# Supported node-vault features

 This is a generated list of Vault features supported by node-vault.`)
fs.writeFileSync('./features.md', result.join('\n'))

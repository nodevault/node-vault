const fs = require('fs-extra')
const features = require('../src/features')

const refreshFeatures = () => {
  const result = Object.keys(features).map(name => {
    const feature = features[name]

    return `
## vault.${name}

\`${feature.method} ${feature.path}\`

${feature.description || 'TODO: add description :S'}
`
  })

  result.unshift(`# Supported Vault features

 This is a generated list of Vault operations supported by node-vault.`)
  return fs.writeFile('./features.md', result.join('\n'))
}

refreshFeatures()

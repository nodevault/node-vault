const fs = require('fs-extra')
const features = require('../src/interface/features')
const resourceMethods = require('../src/interface/resource-methods')

const refreshFeatures = () => {
  const featuresDoc = Object.keys(features).map(name => {
    const feature = features[name]

    return `
## vault.${name}()

\`${feature.method} ${feature.path}\`

${feature.description || 'TODO: add description :S'}
`
  })

  const resourceMethodsDoc = resourceMethods.map(method => {
    return `
## vault.${method.name}(path)

\`${method.operation} <path>${method.query || ''}\`

${method.description || 'TODO: add description :S'}
`
  })

  const result = [...resourceMethodsDoc, ...featuresDoc]

  result.unshift(`# Supported Vault features

 This is a generated list of Vault operations supported by node-vault.`)
  return fs.writeFile('./features.md', result.join('\n'))
}

refreshFeatures()

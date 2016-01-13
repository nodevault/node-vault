# Generate markdown of supported features.
fs = require 'fs'

routes = require("#{__dirname}/../src/routes")

result = "# Supported Vault Features\n"
result += "\n This is a generated list of Vault features supported by node-vault."
for name, route of routes
  result += "\n## vault.#{name}\n"
  result += "\n `#{route.method} #{route.path}`\n"

fs.writeFileSync("#{__dirname}/../features.md", result)

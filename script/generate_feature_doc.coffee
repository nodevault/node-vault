# file script/generate_feature_doc.coffee

# generate markdown of implemented features
fs = require 'fs'

routes = require("#{__dirname}/../src/implemented_routes")

result = "# API\n"

for name, route of routes
  result += "\n## vault.#{name}\n"
  result += "\n `#{route.method} #{route.path}`\n"

fs.writeSync("#{__dirname}/../docs/implemented_routes.md", result)

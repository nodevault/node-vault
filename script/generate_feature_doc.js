// Generate markdown of supported features.
const fs = require('fs');
const commands = require('./../src/commands');

let result = '# Supported Vault Features\n';
result += '\n This is a generated list of Vault features supported by node-vault.';

const renderCommand = (name) => {
  const command = commands[name];
  result += `\n\n## vault.${name}`;
  result += `\n\n '${command.method} ${command.path}'`;
};
Object.keys(commands).forEach(renderCommand);

fs.writeFileSync('./features.md', result);

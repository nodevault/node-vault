const fs = require('fs');
const commands = require('../src/commands');

const result = Object.keys(commands).map(name => {
  const command = commands[name];

  return `
## vault.${name}

\`${command.method} ${command.path}\`
`;
});

result.unshift(`# Supported node-vault features

 This is a generated list of Vault features supported by node-vault.`);
fs.writeFileSync('./features.md', result.join('\n'));

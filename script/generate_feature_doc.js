// Generate markdown of supported features.
const fs = require('fs');
const commands = require('./../src/commands');

var result = '# Supported Vault Features\n';
result += '\n This is a generated list of Vault features supported by node-vault.';

const renderCommand = (command) => {
  result += '\n\n## vault.' + name;
  result += '\n\n`' + command.method + ' ' + command.path + '`';
};

for (var name in commands) {
  renderCommand(commands[name]);
}

fs.writeFileSync('./features.md', result);

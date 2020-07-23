const { compile, DEFAULT_OPTIONS } = require('json-schema-to-typescript');
const { toSafeString } = require('json-schema-to-typescript/dist/src/utils');
const { format } = require('json-schema-to-typescript/dist/src/formatter');
const commands = require('../src/commands');
const fs = require('fs');

async function run() {
  let types = '';
  // TODO : Generate complete index.d.ts automatically
  let commandDefs = `
interface CopyPasteContentIntoIndex { \n
`;
  const commandNames = Object.keys(commands);
  commandNames.sort();
  for (const commandName of commandNames) {
    const command = commands[commandName];
    let reqOpt = 'Option';
    let resOpt = 'unknown';
    if (command.schema) {
      for (const schemaType of Object.keys(command.schema)) {
        const typeName = `${commandName}_${schemaType}`;
        if (schemaType === 'req' || schemaType === 'query') {
          reqOpt = toSafeString(`${commandName}_${schemaType}`);
        } else if (schemaType === 'res') {
          resOpt = toSafeString(`${commandName}_${schemaType}`);
        }
        types += await compile(command.schema[schemaType], typeName, {
          bannerComment: '',
        });
      }
    }
    commandDefs += `${commandName}(options?: ${reqOpt}): Promise<${resOpt}>;\n`;
  }

  commandDefs += `}`;

  types = types.replace(/export /g, '');
  fs.writeFileSync(`types/types.ts`, format(types, DEFAULT_OPTIONS));
  fs.writeFileSync(`types/commands.ts`, format(commandDefs, DEFAULT_OPTIONS));
}

run();

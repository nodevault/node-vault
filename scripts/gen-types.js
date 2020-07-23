const { compile, DEFAULT_OPTIONS } = require('json-schema-to-typescript');
const { toSafeString } = require('json-schema-to-typescript/dist/src/utils');
const { format } = require('json-schema-to-typescript/dist/src/formatter');
const commands = require('../src/commands');
const fs = require('fs');

const compilePromises = [];
// TODO : Generate complete index.d.ts automatically
const commandDefs = ['interface CopyPasteContentIntoIndex {'];
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
      compilePromises.push(
        compile(command.schema[schemaType], typeName, {
          bannerComment: '',
        })
      );
    }
  }
  commandDefs.push(`${commandName}(options?: ${reqOpt}): Promise<${resOpt}>;`);
}

commandDefs.push('}');
fs.writeFileSync(
  'types/commands.ts',
  format(commandDefs.join('\n'), DEFAULT_OPTIONS)
);

Promise.all(compilePromises).then((types) => {
  const typeString = types.join('').replace(/export /g, '');
  fs.writeFileSync('types/types.ts', format(typeString, DEFAULT_OPTIONS));
});

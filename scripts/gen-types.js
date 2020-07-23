const { compile, DEFAULT_OPTIONS } = require('json-schema-to-typescript');
const { toSafeString } = require('json-schema-to-typescript/dist/src/utils');
const { format } = require('json-schema-to-typescript/dist/src/formatter');
const commands = require('../src/commands');
const fs = require('fs');

async function run() {
  let types = '';
  // TODO : Generate complete index.d.ts automatically
  let funs = `
interface CopyPasteContentIntoIndex { \n
`;
  const commandNames = Object.keys(commands);
  commandNames.sort();
  for (k of commandNames) {
    const c = commands[k];
    let reqOpt = 'Option';
    let resOpt = 'unknown';
    if (c.schema) {
      for (schemaType of Object.keys(c.schema)) {
        const typeName = `${k}_${schemaType}`;
        if (schemaType === 'req' || schemaType === 'query') {
          reqOpt = toSafeString(`${k}_${schemaType}`);
        } else if (schemaType === 'res') {
          resOpt = toSafeString(`${k}_${schemaType}`);
        }
        types += await compile(c.schema[schemaType], typeName, {
          bannerComment: '',
        });
      }
    }
    funs += `${k}(options?: ${reqOpt}): Promise<${resOpt}>;\n`;
  }

  funs += `}`;

  types = types.replace(/export /g, '');
  fs.writeFileSync(`types/types.ts`, format(types, DEFAULT_OPTIONS));
  fs.writeFileSync(`types/commands.ts`, format(funs, DEFAULT_OPTIONS));
}

run();

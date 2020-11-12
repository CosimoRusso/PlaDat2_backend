const fs = require('fs');
const path = require('path');

const baseName = path.basename(__filename);
let models = {};

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== baseName && file !== 'db.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    models[model.name] = model;
  });

async function sync() {
  for (const [name, model] of Object.entries(models)) {
    await model.sync();
  }
}

module.exports = { sync, models }
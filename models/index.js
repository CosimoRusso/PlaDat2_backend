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

let Student = models['Student'];
let Matching = models['Matching'];
let Job = models['Job'];
let Company = models['Company'];
let Application = models['Application'];
let JobCategory = models['JobCategory'];
let Skill = models['Skill'];

// associations definition
Student.hasMany(Matching);
Matching.belongsTo(Student);

Job.hasMany(Matching);
Matching.belongsTo(Job);

Student.hasMany(Application);
Application.belongsTo(Student);

Job.hasMany(Application);
Application.belongsTo(Job);

Company.hasMany(Job);
Job.belongsTo(Company);

JobCategory.hasMany(Job);
Job.belongsTo(JobCategory);

Job.belongsToMany(Skill, { through: 'SkillSetReq' });
Skill.belongsToMany(Job, { through: 'SkillSetReq' });

Job.belongsToMany(Skill, { through: 'SkillSetOpt' });
Skill.belongsToMany(Job, { through: 'SkillSetOpt' });

async function sync() {
  for (const [name, model] of Object.entries(models)) {
    await model.sync();
  }
}

module.exports = { sync, models }
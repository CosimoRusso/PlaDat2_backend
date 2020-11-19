const Sequelize = require("./db");
const fs = require('fs');
const path = require('path');
const { databaseConfig } = require("../config/components/database.config");

const baseName = path.basename(__filename);
let models = {};
const sequelize = new Sequelize().getInstance();

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
let Country = models['Country'];
let City = models['City'];

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

Country.hasMany(Company);
Company.belongsTo(Country);

Country.hasMany(City);
City.belongsTo(Country);

City.hasMany(Job);
Job.belongsTo(City);

City.hasMany(Student);
Student.belongsTo(City);

Job.belongsToMany(Skill, { through: 'SkillSetReq' });
Skill.belongsToMany(Job, { through: 'SkillSetReq' });

Job.belongsToMany(Skill, { through: 'SkillSetOpt' });
Skill.belongsToMany(Job, { through: 'SkillSetOpt' });

Student.belongsToMany(Skill, { through: 'StudentSkill' });
Skill.belongsToMany(Student, { through: 'StudentSkill' });

async function sync() {
  await sequelize.sync({ force: databaseConfig.reset });
}

module.exports = { sync, models }
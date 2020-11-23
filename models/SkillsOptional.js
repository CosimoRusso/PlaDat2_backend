const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class SkillsOptional extends Model {}

SkillsOptional.init({

}, {
  sequelize,
  modelName: "SkillsOptional"
});

module.exports = SkillsOptional;
const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class SkillsRequired extends Model {}

SkillsRequired.init({

}, {
  sequelize,
  modelName: "SkillsRequired"
});

module.exports = SkillsRequired;
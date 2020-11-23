const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class StudentSkill extends Model {}

StudentSkill.init({

}, {
  sequelize,
  modelName: "StudentSkill"
});

module.exports = StudentSkill;
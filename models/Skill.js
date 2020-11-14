const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class Skill extends Model {}

Skill.init({
  name: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: "Skill"
});

module.exports = Skill;
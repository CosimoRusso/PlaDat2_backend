const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class Skill extends Model {}

Skill.init({
  name: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE
  },
  updatedAt: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: "Skill"
});

module.exports = Skill;
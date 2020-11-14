const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class Application extends Model {}

Application.init({
  date: {
    type: DataTypes.DATE
  },
  declined: {
    type: DataTypes.BOOLEAN
  }
}, {
  sequelize,
  modelName: "Application"
});

module.exports = Application;
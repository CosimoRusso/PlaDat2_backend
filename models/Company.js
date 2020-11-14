const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class Company extends Model {}

Company.init({
  name: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: "Company"
});

module.exports = Company;
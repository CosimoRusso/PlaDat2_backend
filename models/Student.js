const Sequelize = require('./db');
const { Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize().getInstance();

class Student extends Model {}

Student.init({
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: "Student"
});

module.exports = Student;

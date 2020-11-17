const { jwtSecret } = require('../config/components/server.config');
const jwt = require('jsonwebtoken');
const { Student, Company } = require('../models').models;

module.exports = async (ctx, next) => {
  const token = ctx.header.authorization.replace('Bearer ', '');
  const jwtObj = jwt.verify(token, jwtSecret);
  const model = jwtObj.userType === 'student' ? Student : Company;
  ctx.user = await model.findByPk(jwtObj.id);
  await next();
};

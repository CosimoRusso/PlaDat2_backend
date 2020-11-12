'use strict';
const { models } = require('../../models');
const { Student } = models;

exports.getOne = async ctx => {
  const { userId } = ctx.params;
  const student = await Student.findByPk(userId);
  ctx.assert(student, 404, "The requested user doesn't exist");
  ctx.status = 200;
  ctx.body = student;
};

exports.getAll = async ctx => {
  ctx.status = 200;
  ctx.body = await Student.findAll();
};

exports.createOne = async ctx => {
  const { firstName, lastName } = ctx.request.body;
  ctx.assert(firstName, 400, 'The user info is malformed!');
  ctx.assert(lastName, 400, 'The user info is malformed!');
  const newStudent = await Student.create({firstName, lastName});
  ctx.status = 201;
  ctx.body = newStudent;
};

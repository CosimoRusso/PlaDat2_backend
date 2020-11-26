'use strict';
const { Skill } = require("../../models").models;

//TODO write tests and documentation
exports.getOne = async ctx => {
  let { skillId } = ctx.params;
  skillId = parseInt(skillId);
  if (!skillId) throw {status: 400, message: 'Invalid skill id'};
  const skill = await Skill.findOne({where: {id: skillId}});
  if (!skill) throw {status: 404, message: 'Skill not found'};
  ctx.body = skill;
}

exports.getAll = async ctx => {
  ctx.body = await Skill.findAll();
}

exports.createOne = async ctx => {
  const { name } = ctx.request;
  const exists = await Skill.findOne({where: {name}});
  if (exists) throw {status: 400, message: 'Skill already exists'};
  const newSkill = await Skill.create({ name });
  if (!newSkill) throw {status: 500, message: 'Something went wrong while creating the skill'};
  ctx.body = newSkill;
};
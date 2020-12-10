'use strict';
const { Skill, SkillCategory } = require("../../models").models;

exports.getOne = async ctx => {
  let { skillId } = ctx.params;
  skillId = parseInt(skillId);
  if (!skillId) throw {status: 400, message: 'Invalid skill id'};
  const skill = await Skill.findByPk(skillId, {include: [{model: SkillCategory, as: 'SkillCategory'}]});
  if (!skill) throw {status: 404, message: 'Skill not found'};
  ctx.body = skill;
}

//TODO write tests
exports.getAll = async ctx => {
  ctx.body = await Skill.findAll();
}

//TODO write tests
exports.createOne = async ctx => {
  const { name } = ctx.request;
  const exists = await Skill.findOne({where: {name}});
  if (exists) throw {status: 400, message: 'Skill already exists'};
  const newSkill = await Skill.create({ name });
  if (!newSkill) throw {status: 500, message: 'Something went wrong while creating the skill'};
  ctx.body = newSkill;
};

//TODO write tests
exports.findByCategory = async ctx => {
  let { categoryId } = ctx.params;
  categoryId = parseInt(categoryId);
  if (!categoryId) throw {status: 400, message: 'Invalid category id'};
  const skills = await Skill.findAll({ where: { SkillCategoryId: categoryId } });
  ctx.body = skills;
}
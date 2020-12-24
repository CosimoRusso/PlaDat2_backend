'use strict';
const { Job, Company, Skill, City, Country, SkillSetOpt, SkillSetReq} = require("../../models").models;

//TODO write tests
exports.getOne = async ctx => {
  let { jobId } = ctx.params;
  jobId = parseInt(jobId);
  if (!jobId) throw {status: 400, message: 'Invalid job id'};
  const job = await Job.findOne({
    where: {id: jobId},
    include: [
      {model: Company},
      {model: City, include:[{ model: Country }]},
      {model: Skill, as: 'requiredSkills'},
      {model: Skill, as: 'optionalSkills'},
    ]});
  if (!job) throw {status: 404, message: 'Job not found'};
  ctx.body = job;
}

exports.getAll = async ctx => {
  ctx.body = await Job.findAll({include: [{model: Company}]});
}

exports.createOne = async ctx => {
  const body = ctx.request;
  if (!body.CompanyId) throw {status: 400, message: 'Company id is required'};
  const newJob = await Job.create(body);
  if (!newJob) throw {status: 500, message: 'Something went wrong while creating the job'};
  ctx.body = newJob;
};

exports.update = async ctx => {
  const { jobId, name, description, timeLimit, salary, partTime, remote, CityId } = ctx.request.body;
  const company = ctx.user;
  if(!company) throw {status: 400, message: 'You must be logged in'};

  const job = await Job.findOne({ where: {id: jobId}});
  if(name){
    await job.update({name: name});
  }
  if(description){
    await job.update({description: description});
  }
  if(timeLimit){
    await job.update({timeLimit: timeLimit});
  }
  if(salary){
    await job.update({salary: salary});
  }
  if(partTime){
    await job.update({partTime: partTime});
  }
  if(remote){
    await job.update({remote: remote});
  }
  if(CityId){
    await job.update({CityId: CityId});
  }

  ctx.status = 200;
  ctx.body = { message: 'Job updated' };
}

exports.removeRequiredSkill = async ctx => {
  const { jobId, skillId} = ctx.params;
  const company = ctx.user;
  if(!company) throw {status: 400, message: 'You must be logged in'};

  const exist = await SkillSetReq.findOne({where: {JobId: jobId, SkillId: skillId}});
  if(!exist){
    throw { status: 404, message: 'Skill does not exist' };
  }else{
     await SkillSetReq.destroy({where: {JobId: jobId, SkillId: skillId}});
     ctx.body = { message: 'Required skill deleted' };
     ctx.status = 200;
  }
}

exports.AddRequiredSkill = async ctx => {
  const { jobId, skillId} = ctx.params;
  const company = ctx.user;
  if(!company) throw {status: 400, message: 'You must be logged in'};

  const exist = await SkillSetReq.findOne({where: {JobId: jobId, SkillId: skillId}});
  if(exist) throw { status: 404, message: 'Required skill already exists' };
  await SkillSetReq.create({ JobId: jobId, SkillId: skillId });
  ctx.body = { message: 'Required skill added' };
  ctx.status = 200;
}

exports.removeOptionalSkill = async ctx => {
  const { jobId, skillId} = ctx.params;
  const company = ctx.user;
  if(!company) throw {status: 400, message: 'You must be logged in'};

  const exist = await SkillSetOpt.findOne({where: {JobId: jobId, SkillId: skillId}});
  if(!exist){
    throw { status: 404, message: 'Skill does not exist' };
  }else{
     await SkillSetOpt.destroy({where: {JobId: jobId, SkillId: skillId}});
     ctx.body = { message: 'Optional skill deleted' };
     ctx.status = 200;
  }
}

exports.AddOptionalSkill = async ctx => {
  const { jobId, skillId} = ctx.params;
  const company = ctx.user;
  if(!company) throw {status: 400, message: 'You must be logged in'};

  const exist = await SkillSetOpt.findOne({where: {JobId: jobId, SkillId: skillId}});
  if(exist) throw { status: 404, message: 'Optional skill already exists' };
  await SkillSetOpt.create({ JobId: jobId, SkillId: skillId });
  ctx.body = { message: 'Optional skill added' };
  ctx.status = 200;
}
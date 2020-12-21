'use strict';
const { Job, Company, Skill, City, Country} = require("../../models").models;

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
  const { jobId, name, description, timeLimit, salary, partTime, remote } = ctx.request.body;

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

  ctx.status = 200;
  ctx.body = { message: 'Job updated' };
}
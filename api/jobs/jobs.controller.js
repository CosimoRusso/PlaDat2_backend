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
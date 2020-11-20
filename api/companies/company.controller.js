'use strict';
const { Matching, Application, Job } = require("../../models").models;

exports.companyAcceptStudent = async ctx => {
  const { jobId, studentId } = ctx.params;

  const company = ctx.user;
  // check that the job belongs to the company
  const jobObj = await Job.findOne({where: {id: jobId, CompanyId: company.id}});
  if(!jobObj) throw { status: 401, message: "This job does not belong to you" };

  const application = await Application.findOne({where: { JobId: jobId, StudentId: studentId, declined: null }});
  if(!application) throw { status: 400, message: "This user did not apply to this job" };

  await application.update({declined: "false"});
  console.log("APPLICATION.DECLINED: " + application.declined);
  ctx.body = ""
  ctx.status = 201;
};
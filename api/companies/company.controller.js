'use strict';
const { Matching, Application } = require("../../models").models;



exports.companyAcceptStudent = async ctx => {
  const { jobId, studentId } = ctx.params;

  const application = await Application.findOne({where: { JobId: jobId, StudentId: studentId }});
  if(!application) throw { status: 400, message: "This user did not apply to this job" };

  await Matching.create({ discarded: false, StudentId: studentId, JobId: jobId });
  ctx.body = ""
  ctx.status = 201;
};
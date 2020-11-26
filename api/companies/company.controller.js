'use strict';
const { Matching, Application, Job, Student,Company } = require("../../models").models;
const signJWT=require('../../utils/signJWT');
// const pgDate = require("../../utils/postgresDate");
// const { Op } = require("sequelize");
// const Sequelize = require("../../models/db");
const { hash, compare } = require('../../utils/password');

//TODO write tests and documentation
exports.getOne = async ctx => {
  let { companyId } = ctx.params;
  companyId = parseInt(companyId);
  if(!companyId) throw {status: 400, message: 'Invalid company id'};
  const company = await Company.findOne({where: {id: companyId}});
  if (!company) throw {status: 404, message: 'Company not found'};
  ctx.body = company;
}

exports.companyAcceptStudent = async ctx => {
  const { jobId, studentId } = ctx.params;
  const company = ctx.user;
  // check that the job belongs to the company
  const jobObj = await Job.findOne({where: {id: jobId, CompanyId: company.id}});
  if(!jobObj) throw { status: 401, message: "This job does not belong to you" };

  const application = await Application.findOne({where: { JobId: jobId, StudentId: studentId, declined: null }});
  if(!application) throw { status: 400, message: "This user did not apply to this job" };

  await application.update({declined: "false"});
  ctx.body = ""
  ctx.status = 201;
};

exports.getCandidatesForJob = async ctx =>{
  const {jobId} = ctx.params;
  const company = ctx.user;
  //check if the job belongs to the company
  const jobObj = await Job.findOne({where: {id: jobId, CompanyId: company.id}});
  if(!jobObj) throw { status: 400, message: "This job does not belong to you" };

  /**
   * Takes the jobIds, queries in Application to find the studentId
   * Returns a list of students (fetched using the studentsIds)
   */
  const studentsApplied = await Student.findAll(
    {include: [{
      model: Application,
      where:{JobId:jobObj.id, declined:null}
    }]}
  );
  ctx.status=200;
  ctx.body = studentsApplied
}



exports.login = async ctx => {
  const {email, password} = ctx.request.body;
  const user = await Company.findOne({where: {email:email}});
  if( !user ){
    throw { status: 404, message: "Mail not found, user does not exist" };
  }
  const p = await compare(password, user.password);
  if(p){
    const token= signJWT({userType: "company", id:user.id});
    ctx.status = 200;
    ctx.body={
      message:"Successfully logged in",
      id: user.id,
      jwt: token
    }
  }else{
    throw { status: 401, message: "Auth failed" };
  }
};
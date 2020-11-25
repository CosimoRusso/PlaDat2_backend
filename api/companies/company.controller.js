'use strict';
const { Matching, Application, Job, Student,Company } = require("../../models").models;

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
  const user = await Company.findOne({where: {email:ctx.request.body.email}})
  if(user.length<1){
    throw { status: 401, message: "Mail not found, user does not exist" };
  }
  const p = await compare(ctx.request.body.password, user.password);
  if(!p){
    const token= signJWT({userType: "company", id:user.id});
    console.log(Date.now())
    ctx.body={
      message:"Succesfully logged in",
      token:token
    }
  }else{
    throw { status: 401, message: "Auth failed" };
  }
};
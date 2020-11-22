'use strict';
const { models } = require('../../models');
const { Student, Job, Company, Application } = models;
const signJWT=require('../../utils/signJWT');
const { compare } = require("../../utils/password");

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

exports.getApplications = async ctx => {
  const student = ctx.user;
  ctx.body = await student.getApplications({
    include: [ {
      model: Job,
      as: "Job",
      include: [ {model: Company, as: "Company"} ]
    } ]
  });
}


exports.login = async ctx => {
  const user = await Student.findOne({where: {email:ctx.request.body.email}})
  if(user.length<1){
    throw { status: 401, message: "Mail not found, user does not exist" };
  }
  const p = await compare(ctx.request.body.password, user.password);
  if(!p){
    const token= signJWT({userType: "student", id:user.id});
    ctx.body={
      message:"Succesfully logged in",
      token:token
    }
  }else{
    throw { status: 401, message: "Auth failed" };
  }
};

exports.apply = async ctx => {
  const { jobId } = ctx.params;
  const studentId = ctx.user.id;

  const application = await Application.findOne({where: { JobId: jobId, StudentId: studentId }});
  if(application) throw { status: 400, message: "This student already applied for this job." };

  await Application.create( {date: null, declined: null, StudentId: studentId, JobId: jobId});
  ctx.body = "Student applied"
  ctx.status = 201;
};



'use strict';
const { models } = require('../../models');
const { Student, Job, Company } = models;
const signJWT=require('../../utils/signJWT');

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
  const user =await Student.findOne({where: {email:ctx.request.body.email}})

    if(user.length<1){
      throw { status: 401, message: "Mail not found, user does not exist" };
    }
    var p= ctx.request.body.password.localeCompare(user.password)
    if(p==0){
      console.log(user.id);
    const  token= signJWT({userType: "student",id:user.id});

      ctx.body={
    message:"Succesfully logged in"  ,
    token:token
  }
  return
    }
    throw { status: 401, message: "Auth failed" };


};




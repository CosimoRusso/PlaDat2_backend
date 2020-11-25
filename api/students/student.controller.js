'use strict';
const { models } = require('../../models');
const { Student, Job, Company, Application, Skill, Matching } = models;
const signJWT=require('../../utils/signJWT');
const pgDate = require("../../utils/postgresDate");
const { Op } = require("sequelize");
const Sequelize = require("../../models/db");
const { hash, compare } = require('../../utils/password');

const sequelize = new Sequelize().getInstance();

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

exports.register = async ctx => {
  const { firstName, lastName, email, password, dateOfBirth, picture, cityId } = ctx.request.body;
  if (!email || !password) throw { status: 400, message: 'email and password fields are required' };
  console.log("EMAIL " + email);
  const alreadyExists = await Student.findOne({where: {email}});
  console.dir(alreadyExists);
  if(alreadyExists) throw { status: 400, message: 'email already used' };
  console.log('CCCCCCCCCCCCCCCCCCCCCCC');
  const hashedPassword = await hash(password);
  const student = await Student.create({ firstName, lastName, email, password: hashedPassword, dateOfBirth, picture, cityId });

  if (!student) throw {status: 500, message: 'Unexpected Error'};

  ctx.status = 201;
}

exports.login = async ctx => {
  const {email, password} = ctx.request.body;
  const user = await Student.findOne({where: {email:email}});
  if( !user ){
    throw { status: 404, message: "Mail not found, user does not exist" };
  }
  const p = await compare(password, user.password);
  if(p){
    const token= signJWT({userType: "student", id:user.id});
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

exports.apply = async ctx => {
  const { jobId } = ctx.params;
  const studentId = ctx.user.id;

  const application = await Application.findOne({where: { JobId: jobId, StudentId: studentId }});
  if(application) throw { status: 400, message: "This student already applied for this job." };

  await Application.create( {date: new Date().toISOString().slice(0,10), declined: null, StudentId: studentId, JobId: jobId});
  ctx.body = "Student applied"
  ctx.status = 201;
};

exports.searchJobs = async ctx => {
  const skills = await ctx.user.getSkills();
  const today = pgDate(new Date());

  const alreadyExcludedJobs = sequelize.dialect.queryGenerator.selectQuery("Matchings", {
    attributes: ['JobId'],
    where: { StudentId: ctx.user.id, discarded: true }
  }).slice(0, -1); // removes ';'

  const alreadyAppliedJobs = sequelize.dialect.queryGenerator.selectQuery("Applications", {
    attributes: ['JobId'],
    where: { StudentId: ctx.user.id }
  }).slice(0, -1); // removes ';'

  let jobs = await Job.findAll({
    where:
      {
        timeLimit: { [Op.gt]: today },
        id: {
          [Op.and]: [
            { [Op.notIn]: sequelize.literal('('+alreadyExcludedJobs+')') },
            { [Op.notIn]: sequelize.literal('('+alreadyAppliedJobs+')') }
          ]  },
      },
    include: [
      {model: Skill, as: "requiredSkills" },
    ]
  });
  jobs = jobs.filter(j => isSubset(j.requiredSkills.map(x => x.id), skills.map(x => x.id)));
  ctx.body = jobs;

}

function isSubset(smallSet, bigSet){
  return smallSet.every(smallEl => bigSet.includes(smallEl))
}
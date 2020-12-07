'use strict';
const { models } = require('../../models');
const { Student, Job, Company, Application, Skill, Matching, StudentSkill } = models;
const signJWT=require('../../utils/signJWT');
const pgDate = require("../../utils/postgresDate");
const { Op } = require("sequelize");
const Sequelize = require("../../models/db");
const { hash, compare } = require('../../utils/password');

const sequelize = new Sequelize().getInstance();

exports.getOne = async ctx => {
  const { userId } = ctx.params;
  const student = await Student.findByPk(userId, {include: [{model: Skill, as: 'skills'}]});
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
  if (!email || !password) throw { status: 400, message: 'Email and password are required fields' };
  const alreadyExists = await Student.findOne({where: {email}});
  if(alreadyExists) throw { status: 400, message: 'Email already used' };
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

  await Application.create( {date: pgDate(new Date()), declined: null, StudentId: studentId, JobId: jobId});
  ctx.body = { message: 'Student applied' };
  ctx.status = 201;
};

exports.discard = async ctx => {
  const jobId = parseInt(ctx.params.jobId);
  const studentId = ctx.user.id;

  if(!jobId) throw { status: 400, message: 'Bad format for job id' }
  const job = await Job.findOne({where: {id: jobId}});
  if (!job) throw { status: 400, message: 'Job with given id not found' }
  let matching = await Matching.findOne({where: { StudentId: studentId, JobId: jobId }});
  if (matching) {
    await matching.update({discarded: true});
  }else{
    matching = await Matching.create({discarded: true, StudentId: studentId, JobId: jobId});
  }
  if (!matching || !matching.discarded) throw { status: 400, message: 'Unexpected error while discarding job' }
  ctx.body = { message: 'Job discarded' };
  ctx.status = 201;
};

exports.searchJobs = async ctx => {
  const ratings = await ctx.user.getStudentSkills()
  const today = pgDate(new Date());

  const alreadyExcludedJobs = sequelize.dialect.queryGenerator.selectQuery("Matchings", {
    attributes: ['JobId'],
    where: { StudentId: ctx.user.id, discarded: true }
  }).slice(0, -1); // removes ';'

  const alreadyAppliedJobs = sequelize.dialect.queryGenerator.selectQuery("Applications", {
    attributes: ['JobId'],
    where: { StudentId: ctx.user.id }
  }).slice(0, -1); // removes ';'
  
  /*collects all the skills of the student */
  const skillStudent = sequelize.dialect.queryGenerator.selectQuery("StudentSkills",{
    attributes: ['SkillId'],
    where: {StudentId: ctx.user.id, rating: {[Op.gt]: 2}}
  }).slice(0, -1);// removes ';'
  
  /*collects all the skill that the student does not have*/
  const notSkillStudent = sequelize.dialect.queryGenerator.selectQuery("StudentSkills",{
    attributes: ['SkillId'],
    where: {SkillId:{[Op.notIn]: sequelize.literal('('+skillStudent+')')}}
  }).slice(0, -1);// removes ';'

  /*collects all jobs  that contain a skill the student does not possess */

  const jobStudentIsNotQualifiedFor = sequelize.dialect.queryGenerator.selectQuery("SkillSetReqs",{
    attributes: ['JobId'],
    where: {SkillId: {[Op.in]: sequelize.literal('('+notSkillStudent+')')}}
  }).slice(0, -1);// removes ';'

  /*collect all the jobs that contain a skill that the student does not possess */
  const jobStudentIsQualifiedFor = sequelize.dialect.queryGenerator.selectQuery("Jobs", {
    attributes: ['id'],
    where: {id: {[Op.notIn]: sequelize.literal('('+jobStudentIsNotQualifiedFor+')')}}
  }).slice(0, -1);// removes ';'

  let jobs = await Job.findAll({
    where:
      {
        timeLimit: { [Op.gt]: today },
        id: {
          [Op.and]: [
            { [Op.notIn]: sequelize.literal('('+alreadyExcludedJobs+')') },
            { [Op.notIn]: sequelize.literal('('+alreadyAppliedJobs+')') } ,
            { [Op.in]: sequelize.literal('('+jobStudentIsQualifiedFor+')') } 
          ]  },
      },
    include: [
      {model: Skill, as: "requiredSkills"},
      {model: Skill, as: "optionalSkills"},
    ]
  });
  
  jobs = jobs.sort(function(j1,j2){return jobFitness(j2, ratings) - jobFitness(j1, ratings)})
  ctx.body = jobs;
}
/**
 * Calculates the fitness of the job for the student
 * It has two parameters, alpha regulates the contribution of requested skills to the final result (the weight of the contribution of the optional skills will be 1-alpha)
 * The constant denominator helps both with division by zero and making sure that we take into consideration how many skills are matched in the final result (if I match 1 out of 1 skill is different from matching 10/10 skills, and adding a constant value at the denominator adds this information). It basically discourages matches with jobs with few overall skills 
 * The fitness formula is the following (alpha)*(sum of the rating of the student for the given required skill)/(number of required skills*5 + constant_denominator) + (1-alpha)*(sum of the rating of the student for the optional skills)/(number of optional skills*5 + constant_denominator)
 * The denominator has a "*5" in it to ensure that the fitness is never bigger than one
 */
function jobFitness(job, ratings){
  const alpha = 0.6
  const constantDenominatorValue = 2;

  let totalCountRequired = job.requiredSkills.length; //counts how many required skills are in the job
  let totalCountOptional = job.optionalSkills.length; //counts how many optional skills are in the job

  let sumRatingRequired = 0; //sum of the skill rating of the skill required by job (note that the rating represents how good a student is at a certain skill)
  let sumRatingOptional = 0; //sum of the skill rating of the optional skill by job (note that the rating represents how good a student is at a certain skill)

  //sum all the ratings of the skills
  ratings.forEach(owned =>{
    if(job.requiredSkills.map(x => x.id).includes(owned.SkillId)){
      sumRatingRequired += owned.rating;
    }
    if(job.optionalSkills.map(x => x.id).includes(owned.SkillId)){
      sumRatingOptional += owned.rating;
    }
  })

  return alpha*sumRatingRequired/(totalCountRequired*5+constantDenominatorValue) + (1-alpha)*sumRatingOptional/(totalCountOptional*5+constantDenominatorValue)
}

const r2 = require("r2");
const { searchJobs } = require("../../api/students/student.controller");
const { Student, Application, Company, Job, Skill, SkillSetReq, SkillSetOpt, StudentSkill, Matching } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
  const skills = await Skill.findAll();
  const getSkill = name => skills.find(s => s.name === name);

  o.student = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "student@searchJob.com" });
  o.studentSkill = [];
  o.studentSkill.push(StudentSkill.create({ StudentId: o.student.id, SkillId: getSkill("C#").id }));

  o.studentAPI = await Student.create({ firstName: 'PippoAPI', lastName: 'Pluto', email: "studentAPI@searchJob.com" });
  o.studentAPISkill = [];
  o.studentAPISkill.push(StudentSkill.create({ StudentId: o.studentAPI.id, SkillId: getSkill("C#").id }));

  o.verySkilledStudent = await Student.create({ firstName: 'Rino', lastName: 'Pape', email: "paperino@house.com" });
  o.verySkilledStudentSkill = [];
  o.verySkilledStudentSkill.push(StudentSkill.create({ StudentId: o.verySkilledStudent.id, SkillId: getSkill("C#").id }));
  o.verySkilledStudentSkill.push(StudentSkill.create({ StudentId: o.verySkilledStudent.id, SkillId: getSkill("NodeJS").id }));

  o.company = await Company.create({email: "company@company.com"});

  o.job = await Job.create({CompanyId: o.company.id, timeLimit: "2030-01-10", name: "Normal Job"});
  o.skillsRequiredJob1 = await SkillSetReq.create({ JobId: o.job.id, SkillId: getSkill("C#").id });

  o.jobExpired = await Job.create({CompanyId: o.company.id, timeLimit: "2010-01-10", name: "Expired Job"});
  o.skillsRequiredJobExpired = await SkillSetReq.create({ JobId: o.jobExpired.id, SkillId: getSkill("C#").id });

  o.jobWithMoreReqSkills = await Job.create({CompanyId: o.company.id, timeLimit: "2030-01-10", name: "Hard Job"});
  o.skillsRequiredJobMoreReqSkills = [];
  o.skillsRequiredJobMoreReqSkills.push(await SkillSetReq.create({ JobId: o.jobWithMoreReqSkills.id, SkillId: getSkill("C#").id }));
  o.skillsRequiredJobMoreReqSkills.push(await SkillSetReq.create({ JobId: o.jobWithMoreReqSkills.id, SkillId: getSkill("NodeJS").id }));

  o.jobWithTooManySkills = await Job.create({CompanyId: o.company.id, timeLimit: "2030-01-10", name: "Job Very Skilled"});
  o.skillsRequiredJobTooManySkills = [];
  o.skillsRequiredJobTooManySkills.push(await SkillSetReq.create({ JobId: o.jobWithTooManySkills.id, SkillId: getSkill("C#").id }));
  o.skillsRequiredJobTooManySkills.push(await SkillSetReq.create({ JobId: o.jobWithTooManySkills.id, SkillId: getSkill("F#").id }));
  o.skillsRequiredJobTooManySkills.push(await SkillSetReq.create({ JobId: o.jobWithTooManySkills.id, SkillId: getSkill("NodeJS").id }));
  o.skillsRequiredJobTooManySkills.push(await SkillSetReq.create({ JobId: o.jobWithTooManySkills.id, SkillId: getSkill("Sequelize").id }));

  o.jobDiscarded = await Job.create({CompanyId: o.company.id, timeLimit: "2030-01-10", name: "Discarded Job"});
  o.skillsRequiredJobDiscarded = await SkillSetReq.create({ JobId: o.jobDiscarded.id, SkillId: getSkill("C#").id });
  o.mathingDiscarded = await Matching.create({StudentId: o.student.id, JobId: o.jobDiscarded.id, discarded: true});

  o.jobApplied = await Job.create({CompanyId: o.company.id, timeLimit: "2030-01-10", name: "Applied Job"});
  o.skillsRequiredJobApplied = await SkillSetReq.create({ JobId: o.jobApplied.id, SkillId: getSkill("C#").id });
  o.jobApplication = await Application.create({StudentId: o.student.id, JobId: o.jobApplied.id, declined: null});

});

/* This looks complicated, but it simply takes all the objects
 that there are inside 'o' (our database objects) and deletes them.
 It then closes the connection to the database. IMPORTANT! OTHERWISE
 TEST FAIL
*/
afterAll(async () => {
  let promises = [];
  for (let key of Object.keys(o)){
    promises.push(o[key].destroy);
  }
  await Promise.all(promises);
  await sequelize.close();
});

// unit tests - here you can include directly the middleware so you skip authorization!
test("Student cannot find the expired job", async function (){
  const { student, jobExpired } = o;
  const ctx = { user: student };
  await searchJobs(ctx, noop);
  expect(ctx.body.length).toBeGreaterThan(0);
  const jobs = ctx.body;
  expect(jobs.find(j => j.id === jobExpired.id)).toBeUndefined();
});

test("Student cannot find the job with too many mandatory skills", async function (){
  const { student, jobWithTooManySkills } = o;
  const ctx = { user: student };
  await searchJobs(ctx, noop);
  expect(ctx.body.length).toBeGreaterThan(0);
  const jobs = ctx.body;
  expect(jobs.find(j => j.id === jobWithTooManySkills.id)).toBeUndefined();
});

test("Student cannot find the job he already discarded", async function (){
  const { student, jobDiscarded } = o;
  const ctx = { user: student };
  await searchJobs(ctx, noop);
  expect(ctx.body.length).toBeGreaterThan(0);
  const jobs = ctx.body;
  expect(jobs.find(j => j.id === jobDiscarded.id)).toBeUndefined();
});

test("Student cannot find the job he already applied to", async function (){
  const { student, jobApplied } = o;
  const ctx = { user: student };
  await searchJobs(ctx, noop);
  expect(ctx.body.length).toBeGreaterThan(0);
  const jobs = ctx.body;
  expect(jobs.find(j => j.id === jobApplied.id)).toBeUndefined();
});

//api test - here you can test the API with an actual HTTP call, a more realistic test
test("The student can find some jobs - API version", async function (){
  const { studentAPI, verySkilledStudent, job, jobWithMoreReqSkills, company, applicationAPI } = o;
  const studentId = studentAPI.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  const url = `http://localhost:3000/api/v1/student/jobs/search`;
  const jobs = await r2.get(url, {headers: {authorization: "Bearer " + jwt}}).json;
  expect(jobs.length).toBeGreaterThan(0);
  expect(jobs.find(j => j.id === job.id)).toBeDefined();

  // verify that the jobs are ordered by deacreasing matching skills
  const anotherJwt = signJWT({id: verySkilledStudent.id, userType: "student"});
  const orderedJobs = await r2.get(url, {headers: {authorization: "Bearer " + anotherJwt}}).json;
  expect(orderedJobs[0].id).toEqual(jobWithMoreReqSkills.id);
});
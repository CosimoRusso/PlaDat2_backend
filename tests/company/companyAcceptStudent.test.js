const r2 = require("r2");
const { companyAcceptStudent } = require("../../api/companies/company.controller");
const { Student, Application, Matching, Company, Job } = require('../../models').models;
const Sequelize = require('../../models/db');

const noop = () => {};
const sequelize = new Sequelize().getInstance();

const o = {};

beforeAll(async () => {
  o.student = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "student@lol.c" });
  o.studentNotApplied = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "studentNotApplied@lol.c" });
  o.studentAPI = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "studentAPI@lol.c" });
  o.company = await Company.create({email: "company@company.com"});
  o.job = await Job.create();
  o.application = await Application.create({StudentId: o.student.id, JobId: o.job.id});
  o.applicationAPI = await Application.create({StudentId: o.studentAPI.id, JobId: o.job.id});
});

afterAll(async () => {
  let promises = [];
  for (let key of Object.keys(o)){
    promises.push(o[key].destroy);
  }
  await Promise.all(promises);
  await sequelize.close();
});

// unit tests
test("The company cannot accept a student that did not apply", async function (){
  const { studentNotApplied, job } = o;
  const ctx = {params: { studentId: studentNotApplied.id, jobId: job.id }};
  try{
    await companyAcceptStudent(ctx, noop);
  }catch(e){
    expect(e.status).toBe(400);
    expect(e.message).toBeDefined();
  }
});

test('The company can actually accept the student', async function() {
  const { student, job } = o;
  const ctx = {params: { studentId: student.id, jobId: job.id }};
  await companyAcceptStudent(ctx, noop);
  matching = await Matching.findOne({where: { JobId: job.id, StudentId: student.id }});
  expect(student.id).toBeGreaterThan(0);
  expect(matching.StudentId).toBe(student.id);
  expect(matching.JobId).toBe(job.id);
  expect(matching.id).toBeGreaterThan(0);
});

//api test
test("The company can actually accept the student - API version", async function (){
  const { company, studentAPI, job } = o;
  const companyId = company.id, studentId = studentAPI.id, jobId = job.id;
  const url = `http://localhost:3000/api/v1/company/${companyId}/jobs/${jobId}/accept/${studentId}`;
  const response = await r2.post(url).response;
  expect(response.status).toBe(201);
  const newMatching = await Matching.findOne({where: { StudentId: studentId, JobId: jobId }});
  expect(newMatching.id).toBeGreaterThan(0);
  expect(newMatching.StudentId).toBe(studentId);
  expect(newMatching.JobId).toBe(jobId);
})

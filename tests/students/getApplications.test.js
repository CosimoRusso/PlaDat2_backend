const r2 = require("r2");
const { getApplications } = require("../../api/students/student.controller");
const { Student, Application, Company, Job } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
  o.student = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "student@lol.c" });
  o.studentNotApplied = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "studentNotApplied@lol.c" });
  o.studentAPI = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "studentAPI@lol.c" });
  o.company = await Company.create({email: "company@company.com"});
  o.job = await Job.create({CompanyId: o.company.id});
  o.jobWithAppDeclined = await Job.create({CompanyId: o.company.id});
  o.jobWithAppAccepted = await Job.create({CompanyId: o.company.id});
  o.application = await Application.create({StudentId: o.student.id, JobId: o.job.id});
  o.applicationDeclined = await Application.create({StudentId: o.student.id, JobId: o.jobWithAppDeclined.id, declined: true});
  o.applicationAccepted = await Application.create({StudentId: o.student.id, JobId: o.jobWithAppDeclined.id, declined: false});
  o.applicationAPI = await Application.create({StudentId: o.studentAPI.id, JobId: o.job.id});
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
test("A student that has no applications receives an empty array", async function (){
  const { studentNotApplied } = o;
  const ctx = {user: studentNotApplied};
  await getApplications(ctx, noop);
  expect(ctx.body.length).toBe(0);
});

test('The student can see his application, and only that one', async function() {
  const { student, job, company, application } = o;
  expect(application.declined).toBe(null);
  const ctx = {user: student};
  await getApplications(ctx, noop);
  expect(ctx.body.length).toBe(1);
  const applicationFromBody = ctx.body[0];
  expect(applicationFromBody.id).toBe(application.id);
  expect(applicationFromBody.Job.id).toBe(job.id);
  expect(applicationFromBody.Job.Company.id).toBe(company.id);
  expect(applicationFromBody.Job.Company.email).toBe(company.email); //just to be sure
});

//api test - here you can test the API with an actual HTTP call, a more realistic test
test("The student can see his application - API version", async function (){
  const { studentAPI, job, company, applicationAPI } = o;
  expect(applicationAPI.declined).toBe(null);
  const studentId = studentAPI.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  const url = `http://localhost:3000/api/v1/student/applications`;
  const response = await r2.get(url, {headers: {authorization: "Bearer " + jwt}}).json;
  expect(response.length).toBe(1);
  const application = response[0];
  expect(application.id).toBe(applicationAPI.id);
  expect(application.Job.id).toBe(job.id);
  expect(application.Job.Company.id).toBe(company.id);
});
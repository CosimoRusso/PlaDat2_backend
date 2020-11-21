const r2 = require("r2");
const { companyAcceptStudent, getCandidatesForJob } = require("../../api/companies/company.controller");
const { Student, Application, Matching, Company, Job } = require('../../models').models;
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
  o.companyThatDidntCreateJob = await Company.create({email: "companynotauth@company.com"});
  o.job = await Job.create({CompanyId: o.company.id});
  o.application = await Application.create({StudentId: o.student.id, JobId: o.job.id});
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

test("Only the company that proposed the job can visualize the applicants", async function(){
    const{companyThatDidntCreateJob, job} = o;
    const ctx = {params: {jobId: job.id}, user: companyThatDidntCreateJob};

    try{
        await getCandidatesForJob(ctx, noop);
    }catch(e){
        expect(e.status).toBe(400);
        expect(e.message).toBeDefined() //the value is not null
    }
});

/*
//api test - here you can test the API with an actual HTTP call, a more realistic test
test("The company can actually accept the student - API version", async function (){
  const { company, studentAPI, job } = o;
  const studentId = studentAPI.id, jobId = job.id;
  const jwt = signJWT({id: company.id, userType: "company"});
  const url = `http://localhost:3000/api/v1/company/jobs/${jobId}/accept/${studentId}`;
  const response = await r2.post(url, {headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(201);
  o.newMatching = await Matching.findOne({where: { StudentId: studentId, JobId: jobId }});
  expect(o.newMatching.id).toBeGreaterThan(0);
  expect(o.newMatching.StudentId).toBe(studentId);
  expect(o.newMatching.JobId).toBe(jobId);
});*/


test("The function returns all and only the candidates", async function(){
  const{company, job, student, studentAPI} = o; 
  const jobId = job.id;
  const jwt = signJWT({id: company.id, userType: "company"});
  const url = `http://localhost:3000/api/v1/company/candidateStudents/${jobId}`;
  const response = await r2.get(url, {headers: {authorization: "Bearer " + jwt}}).response;
  console.dir(response.body);
  console.log(job.id)


});

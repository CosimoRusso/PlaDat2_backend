const r2 = require("r2");
const { apply } = require("../../api/students/student.controller");
const { Student, Application, Company, Job } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
  o.student = await Student.create({ firstName: 'Mirko', lastName: 'Mrki', email: "student@gmail.com" });
  o.studentAlreadyApplied = await Student.create({ firstName: 'Mirko', lastName: 'Mrki', email: "studentApplied@gmail.com" });
  o.studentAPI = await Student.create({ firstName: 'Mirko', lastName: 'Mrki', email: "studentAPI@gmail.com" });
  o.studentAlreadyAppliedAPI = await Student.create({ firstName: 'Mirko', lastName: 'Mrki', email: "studentApplied@gmail.com" });
  o.company = await Company.create({email: "company@gmail.com"});
  o.job = await Job.create({CompanyId: o.company.id});
  o.application = await Application.create({StudentId: o.studentAlreadyApplied.id, JobId: o.job.id});
  o.applicationAPI = await Application.create({StudentId: o.studentAlreadyAppliedAPI.id, JobId: o.job.id});
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

// unit tests
test('Student can actualy appy for the job', async function() {
    const { student, job } = o;
    const ctx = {params: { jobId: job.id }, user: student};
    await apply(ctx, noop);

    const newApplication = await Application.findOne({where: { JobId: job.id, StudentId: student.id }});
    expect(student.id).toBeGreaterThan(0);
    expect(newApplication.StudentId).toBe(student.id);
    expect(newApplication.JobId).toBe(job.id);
    expect(newApplication.id).toBeGreaterThan(0);
    expect(newApplication.declined).toBe(null);
  });

  test('Student already applied for the job', async function() {
    const { studentAlreadyApplied, job } = o;
    const ctx = {params: { jobId: job.id }, user: studentAlreadyApplied};
    try{
        await apply(ctx, noop);
    }catch(e){
        expect(e.status).toBe(400);
        expect(e.message).toBeDefined();
    }
  });

  //API tests
  test("Student can actualy appy for the job - API version", async function (){
    const { studentAPI, job } = o;
    const jobId = job.id;
    const jwt = signJWT({id: studentAPI.id, userType: "student"});
    const url = `http://localhost:3000/api/v1/student/jobs/apply/${jobId}`;
    const response = await r2.post(url, {headers: {authorization: "Bearer " + jwt}}).response;
    
    const newApllication = await Application.findOne({where: { JobId: job.id, StudentId: studentAPI.id }});
    expect(studentAPI.id).toBeGreaterThan(0);
    expect(newApllication.StudentId).toBe(studentAPI.id);
    expect(newApllication.JobId).toBe(job.id);
    expect(newApllication.id).toBeGreaterThan(0);
    expect(newApllication.declined).toBe(null);
    expect(response.status).toBe(201);
  });

  test("Student already applied for the job - API version", async function (){
    const { studentAlreadyAppliedAPI, job } = o;
    const jobId = job.id;
    const jwt = signJWT({id: studentAlreadyAppliedAPI.id, userType: "student"});
    const url = `http://localhost:3000/api/v1/student/jobs/apply/${jobId}`;
    try{
      const response = await r2.post(url, {headers: {authorization: "Bearer " + jwt}}).response;
    }catch(e){
      expect(e.status).toBe(400);
      expect(e.message).toBeDefined();
    }
  });
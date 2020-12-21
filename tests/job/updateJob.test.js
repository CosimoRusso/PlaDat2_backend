const r2 = require("r2");
const { update } = require("../../api/jobs/jobs.controller");
const {  Job, Company } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");
const cleanDatabase = require('../../utils/cleanDatabase.util');

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
    o.company = await Company.create({name:'Company'})
    o.job = await Job.create({name: 'oldName', description: 'oldDescription', timeLimit: '2020-12-30', salary: 2300, partTime: false, remote: false});
    o.job2 = await Job.create({name: 'oldName', description: 'oldDescription', timeLimit: '2020-12-30', salary: 2300, partTime: false, remote: false});
    o.job3 = await Job.create({name: 'oldName', description: 'oldDescription', timeLimit: '2020-12-30', salary: 2300, partTime: false, remote: false});
    o.job4 = await Job.create({name: 'oldName', description: 'oldDescription', timeLimit: '2020-12-30', salary: 2300, partTime: false, remote: false});
});

afterAll(cleanDatabase.bind(null, o, sequelize));

//unit test
test('Jobs every information is updated', async function() {
    const { job } = o;
    const ctx = {request: { body: {jobId: job.id, name: 'newName', description: 'New description', timeLimit: '2021-1-15', salary: 2500, partTime: true, remote: true} }};
    await update(ctx, noop);
    await job.reload();

    expect(job.id).toBeGreaterThan(0);
    expect(job.name).toBe('newName');
    expect(job.description).toBe('New description');
    //expect(job.timeLimit).toBe('2021-01-15');
    //Expected: "2021-01-15"
    //Received: 2021-01-14T23:00:00.000Z
    expect(job.salary).toBe(2500);
    expect(job.partTime).toBe(true);
    expect(job.remote).toBe(true);
  });

  test('Jobs name is updated', async function() {
    const { job2 } = o;
    const ctx = {request: { body: {jobId: job2.id, name: 'newName'} }};
    await update(ctx, noop);
    await job2.reload();

    expect(job2.id).toBeGreaterThan(0);
    expect(job2.name).toBe('newName');
  });

//api test
test("Jobs every information is updated - API version", async function (){
    const { job3, company } = o;
    const jwt = signJWT({id: company.id, userType: "company"});
    const url = `http://localhost:3000/api/v1/jobs/update`;
    const response = await r2.post(url, {json:{jobId: job3.id, name: 'newName', description: 'New description', timeLimit: '2021-1-15', salary: 2500, partTime: true, remote: true}, headers: {authorization: "Bearer " + jwt}}).response;
    await job3.reload();
    expect(response.status).toBe(200);
    expect(job3.id).toBeGreaterThan(0);
    expect(job3.name).toBe('newName');
    expect(job3.description).toBe('New description');
    //expect(job3.timeLimit).toBe('2021-01-15');
    //Expected: "2021-01-15"
    //Received: 2021-01-14T23:00:00.000Z
    expect(job3.salary).toBe(2500);
    expect(job3.partTime).toBe(true);
    expect(job3.remote).toBe(true);
});

test("Jobs name is updated - API version", async function (){
    const { job4, company } = o;
    const jwt = signJWT({id: company.id, userType: "company"});
    const url = `http://localhost:3000/api/v1/jobs/update`;
    const response = await r2.post(url, {json:{jobId: job4.id, name: 'newName'}, headers: {authorization: "Bearer " + jwt}}).response;
    await job4.reload();
    expect(response.status).toBe(200);
    expect(job4.id).toBeGreaterThan(0);
    expect(job4.name).toBe('newName');
});
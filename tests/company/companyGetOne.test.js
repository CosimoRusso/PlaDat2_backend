const r2 = require("r2");
const { getOne } = require("../../api/companies/company.controller");
const { Student, Application, Company, Job } = require('../../models').models;
const Sequelize = require('../../models/db');

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
  o.company = await Company.create({email: "companyCreateTest@company.com", name: 'Company beautiful'});
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
test("The company exists", async function (){
  const { company } = o;
  const ctx = {params: { companyId: company.id }};
  await getOne(ctx, noop);
  expect(ctx.body.name).toBe('Company beautiful');
  expect(ctx.body.email).toBe('companyCreateTest@company.com');
});

test("Search company with a string as id returns 400", async function (){
  const ctx = {params: { companyId: 'hello' }};
  try{
    await getOne(ctx, noop);
  }catch(e){
    expect(e.status).toBe(400);
    expect(e.message).toBeDefined();
  }
});

test("Search company with an id that does not exist returns 404", async function (){
  const ctx = {params: { companyId: 100000 }};
  try{
    await getOne(ctx, noop);
  }catch(e){
    expect(e.status).toBe(404);
    expect(e.message).toBeDefined();
  }
});

//api test - here you can test the API with an actual HTTP call, a more realistic test
test("The company can actually accept the student - API version", async function (){
  const { company } = o;
  const url = `http://localhost:3000/api/v1/company/findOne/${company.id}`;
  const response = await r2.get(url).json;
  expect(response.id).toBe(company.id);
});

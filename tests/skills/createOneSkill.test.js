const r2 = require("r2");
const { createOne } = require("../../api/skills/skills.controller");
const {  Skill, Company } = require('../../models').models;
const Sequelize = require('../../models/db');
const cleanDatabase = require('../../utils/cleanDatabase.util');

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
    o.company = await Company.create({name:'Company'});
    o.skill = await Skill.create({ name: "JavaScript"});
  });

afterAll(cleanDatabase.bind(null, o, sequelize));

//unit test
test('Skill is created', async function() {
    const { company } = o;
    const ctx = {request: {name: 'Flyinnngg'} , user: company};
    await createOne(ctx, noop);
    expect(ctx.status).toBe(200);
  });

  test('Skill already exists', async function() {
    const { company } = o;
    const ctx = {request: {name: 'JavaScript'} , user: company};
    try{
        await createOne(ctx, noop);
    }catch(e){
        expect(e.status).toBe(400);
    }
  });
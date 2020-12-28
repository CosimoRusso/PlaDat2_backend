const r2 = require("r2");
const { addRequiredSkill } = require("../../api/jobs/jobs.controller");
const {  Job, Company, SkillSetReq, Skill } = require('../../models').models;
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
    o.job1 = await Job.create({name: 'oldName', CompanyId: o.company.id});
    o.job2 = await Job.create({name: 'oldName', CompanyId: o.company.id});
    o.job3 = await Job.create({name: 'oldName', CompanyId: o.company.id});
    o.skill = await Skill.create({name: 'JavaScript'});
    o.skillSet = await SkillSetReq.create({ JobId: o.job2.id, SkillId: o.skill.id});
});

afterAll(cleanDatabase.bind(null, o, sequelize));

//unit test
test('Required skill is added', async function() {
    const { job1, company, skill } = o;
    const ctx = { params:{jobId: job1.id, skillId: skill.id}, user: company};
    await addRequiredSkill(ctx, noop);
    const skillSet = await SkillSetReq.findOne({where: {JobId: job1.id, SkillId: skill.id}});
    expect(skillSet.JobId).toBe(job1.id);
    expect(skillSet.SkillId).toBe(skill.id);
  });

  test('Required skill is already added', async function() {
    const { job2, company, skill } = o;
    const ctx = { params:{jobId: job2.id, skillId: skill.id}, user: company};
    try{
        await addRequiredSkill(ctx, noop);
    }catch(e){
        expect(e.status).toBe(401);
        expect(e.message).toBeDefined();
    }
  });

  //api test
  test('Required skill is added - API version', async function() {
    const { job3, company, skill } = o;
    const jwt = signJWT({id: company.id, userType: "company"});
    const jobId = job3.id, skillId = skill.id;
    const url = `http://localhost:3000/api/v1/jobs/update/${jobId}/addReq/${skillId}`;
    const response = await r2.post(url, {headers: {authorization: "Bearer " + jwt}}).response;

    expect(response.status).toBe(200);
    const skillSet = await SkillSetReq.findOne({where: {JobId: job3.id, SkillId: skill.id}});
    expect(skillSet.JobId).toBe(job3.id);
    expect(skillSet.SkillId).toBe(skill.id);
  });

  test('Required skill is already added - API version', async function() {
    const { job2, company, skill } = o;
    const jwt = signJWT({id: company.id, userType: "company"});
    const jobId = job2.id, skillId = skill.id;
    const url = `http://localhost:3000/api/v1/jobs/update/${jobId}/addReq/${skillId}`;
    try{
      const response = await r2.post(url, {headers: {authorization: "Bearer " + jwt}}).response;
    }catch(e){
      expect(e.status).toBe(401);
      expect(e.message).toBeDefined();
    }
  });
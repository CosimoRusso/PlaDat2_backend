const r2 = require("r2");
const { Student, Skill, StudentSkill } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");
const cleanDatabase = require('../../utils/cleanDatabase.util');
const { removeCapability } = require("../../api/students/student.controller");
const { addCapability } = require("../../api/students/student.controller");
const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
  o.student = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "student@modifyCapabilities.com" });
  o.studentAPI = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "studentAPI@modifyCapabilities.com" });

  o.studentSkill = await StudentSkill.create({StudentId: o.student.id, SkillId: 1, rating: 3 });
  o.studentSkill = await StudentSkill.create({StudentId: o.student.id, SkillId: 2, rating: 4 });
  o.studentSkill = await StudentSkill.create({StudentId: o.student.id, SkillId: 3, rating: 5 });
  o.skill=await Skill.create({});
});

afterAll(cleanDatabase.bind(null, o, sequelize));

test("Add capability - API version", async function (){
  const {student } = o;
  const studentId = student.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  const url = `http://localhost:3000/api/v1/student/addCapability/`;
  const response = await r2.post(url,{json:{id:5, rating: 3},headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(201);
});

test("Capability already exist- API version", async function (){
  const { student } = o;
  const studentId = student.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  const url = `http://localhost:3000/api/v1/student/addCapability/`;
  const response = await r2.post(url,{json:{id:1, rating: 5},headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(400);
});

test("Remove capability - API version", async function (){
  const { student } = o;
  const studentId = student.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  const url = `http://localhost:3000/api/v1/student/removeCapability/`;
  const response = await r2.post(url,{json:{removeSkillId:3},headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(200);
});










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
  o.student = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "student@companyAcceptStudent.c" });
  o.studentAPI = await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email: "studentAPI@companyAcceptStudent.c" });

// o.skill = await Skill.create({});
  o.studentSkill = await StudentSkill.create({StudentId: o.student.id, SkillId: 1 });
  o.studentSkill = await StudentSkill.create({StudentId: o.student.id, SkillId: 2 });
  o.studentSkill = await StudentSkill.create({StudentId: o.student.id, SkillId: 3 });
  o.skill=await Skill.create({});

  


});

afterAll(cleanDatabase.bind(null, o, sequelize));

// unit tests - here you can include directly the middleware so you skip authorization!
// test("List not found", async function (){
//   const {user,listOfSkills} = o;
//   const ctx = {request:{body: { listOfSkills:null, user: user}}};
//   try{
  
//     await ModifyCapabilities(ctx, noop);
//   }catch(e){
//     expect(e.status).toBe(404);
//     expect(e.message).toBeDefined();
//   }
// });

// test("Skill deleted successfully", async function (){
//   const {student} = o;
//   const ctx = {request:{body: { removeSkillId: 1}}, user: student};
//     await removeCapability(ctx, noop);
//     const skills = await StudentSkill.findAll({where:{StudentId: student.id}});
//     expect(skills.length).toBe(2);
// });

// test("New skill added", async function (){
//   const {student} = o;
//   const ctx = {request:{body: { newSkillId:4}}, user: student};
//     await addCapability(ctx, noop);
//     const skills = await StudentSkill.findAll({where:{StudentId: student.id}});
//     const skillz = await Skill.findAll;


//     expect(skills.length).toBe(4);
// });

// test("Skill already exists", async function (){
//   const {student} = o;
//   const ctx = {request:{body: { newSkillId:3}}, user: student};
//   let skills = await StudentSkill.findAll({where:{StudentId: student.id}});
//   console.log(skills.length+" a sto je ovo");
//     await addCapability(ctx, noop);
//      skills = await StudentSkill.findAll({where:{StudentId: student.id}});
//     const skillz = await Skill.findAll;
//     expect(skills.length).toBe(3);
// });
test("Add capability - API version", async function (){
  const {student,studentAPI, studentSkill } = o;
  const studentId = student.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  console.log(jwt);
  const url = `http://localhost:3000/api/v1/student/addCapability/`;
  const response = await r2.post(url,{json:{newSkillId:5},headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(200);
});

test("Capability already exist- API version", async function (){
  const {student,studentAPI, studentSkill } = o;
  const studentId = student.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  console.log(jwt);
  const url = `http://localhost:3000/api/v1/student/addCapability/`;
  const response = await r2.post(url,{json:{newSkillId:1},headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(400);
});

test("Remove capability - API version", async function (){
  const {student,studentAPI, studentSkill } = o;
  const studentId = student.id;
  const jwt = signJWT({id: studentId, userType: "student"});
  console.log(jwt);
  const url = `http://localhost:3000/api/v1/student/removeCapability/`;
  const response = await r2.post(url,{json:{removeSkillId:3},headers: {authorization: "Bearer " + jwt}}).response;
  expect(response.status).toBe(200);
});










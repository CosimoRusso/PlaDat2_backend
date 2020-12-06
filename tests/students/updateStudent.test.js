const r2 = require("r2");
const { update } = require("../../api/students/student.controller");
const {  Student } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");
const { hash, compare } =require("../../utils/password");
const cleanDatabase = require('../../utils/cleanDatabase.util');

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
    const hashed = await hash("oldPassword");
    o.student1 = await Student.create({email: "student1@old.com", firstName: "oldName", dateOfBirth:'1998-12-30', lastName: "oldLastname", password: hashed, picture: "oldPic.png"});
    o.student2 = await Student.create({email: "student2@old.com", firstName: "oldName", dateOfBirth:'1998-12-30', lastName: "oldLastname", password: hashed, picture: "oldPic.png"});
    o.student3 = await Student.create({email: "student3@old.com", firstName: "oldName", dateOfBirth:'1998-12-30', lastName: "oldLastname", password: hashed, picture: "oldPic.png"});
    o.student4 = await Student.create({email: "student4@old.com", firstName: "oldName", dateOfBirth:'1998-12-30', lastName: "oldLastname", password: hashed, picture: "oldPic.png"});
    o.apiStudent1 = await Student.create({email: "apistudent1@old.com", firstName: "oldName", dateOfBirth:'1998-12-30', lastName: "oldLastname", password: hashed, picture: "oldPic.png"});
    o.apiStudent2 = await Student.create({email: "apistudent2@old.com", firstName: "oldName", dateOfBirth:'1998-12-30', lastName: "oldLastname", password: hashed, picture: "oldPic.png"});
});

afterAll(cleanDatabase.bind(null, o, sequelize));

//unit test
test('Student can change all the information', async function() {
    const { student1 } = o;
    const ctx = {request: { body: {email: "student1@new.com", firstName: "newName", dateOfBirth:'1998-12-19', lastName: "newLastname", password: 'newPassword', picture: "newPic.png"} }, user: student1};
    await update(ctx, noop);
    await student1.reload();

    expect(student1.id).toBeGreaterThan(0);
    expect(student1.email).toBe('student1@new.com');
    expect(student1.firstName).toBe('newName');
    expect(student1.dateOfBirth).toBe('1998-12-19');
    expect(student1.lastName).toBe('newLastname');
    expect(student1.picture).toBe('newPic.png');
    const comparePassword = await compare('newPassword', student1.password);
    expect(comparePassword).toBe(true);
  });

  test('Student can change only the email', async function() {
    const { student2 } = o;
    const ctx = {request: { body: {email: "student2@new.com"} }, user: student2};
    await update(ctx, noop);
    await student2.reload();

    expect(student2.id).toBeGreaterThan(0);
    expect(student2.email).toBe('student2@new.com');
    expect(student2.firstName).toBe('oldName');
    expect(student2.dateOfBirth).toBe('1998-12-30');
    expect(student2.lastName).toBe('oldLastname');
    expect(student2.picture).toBe('oldPic.png');
    const comparePassword = await compare('oldPassword', student2.password);
    expect(comparePassword).toBe(true);
  });

  test('Student can not change to an already used e-mail', async function() {
    const { student3 } = o;
    const ctx = {request: { body: {email: "student4@old.com"} }, user: student3};
    try{
        await update(ctx, noop);
    }catch(e){
        expect(e.status).toBe(400);
        expect(e.message).toBeDefined();
    }
    student3.reload();
    expect(student3.email).toBe('student3@old.com');
  });

//API tests
test("Student can change all the information - API version", async function (){
    const { apiStudent1 } = o;
    const jwt = signJWT({id: apiStudent1.id, userType: "student"});
    const url = `http://localhost:3000/api/v1/student/update`;
    const response = await r2.post(url, {json:{email: "apistudent1@new.com", firstName: "newName", dateOfBirth:'1998-12-19', lastName: "newLastname", password: 'newPassword', picture: "newPic.png"}, headers: {authorization: "Bearer " + jwt}}).response;
    apiStudent1.reload();

    expect(apiStudent1.id).toBeGreaterThan(0);
    expect(apiStudent1.email).toBe("apistudent1@new.com");
    expect(apiStudent1.firstName).toBe("newName");
    expect(apiStudent1.dateOfBirth).toBe('1998-12-19');
    expect(apiStudent1.lastName).toBe('newLastname');
    expect(apiStudent1.picture).toBe('newPic.png');
    const comparePassword = await compare('newPassword', apiStudent1.password);
    expect(comparePassword).toBe(true);
    expect(response.status).toBe(200);
  });
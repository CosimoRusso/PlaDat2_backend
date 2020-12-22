const { getAll } = require("../../api/skills/skills.controller");
const Sequelize = require('../../models/db');

const sequelize = new Sequelize().getInstance();

const noop = () => {};

afterAll(async () => sequelize.close());

// unit tests - here you can include directly the middleware so you skip authorization!
test("Some skills are returned", async function (){
  const ctx = {};
  await getAll(ctx, noop);
  expect(ctx.body.length).toBeGreaterThan(0);
  expect(ctx.status).toBe(200);
});
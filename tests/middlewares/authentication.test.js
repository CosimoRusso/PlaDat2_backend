const signJWT = require('../../utils/signJWT');
const authMiddleware = require('../../middleware/authentication');
const { Student } = require('../../models').models;
const Sequelize = require('../../models/db');

const noop = () => {};
const email = 'pippo@poppi.it';
const sequelize = new Sequelize().getInstance();

beforeAll(async () => {
  await Student.create({ firstName: 'Pippo', lastName: 'Pluto', email });
});

afterAll(async () => {
  await Student.destroy({ where: { email } });
  await sequelize.close();
});

// unit tests
test('authentication works', async function() {
  const student = await Student.findOne({ where: { email } });
  const token = signJWT({ id: student.id, userType: 'student' });
  const ctx = { header: { authorization: 'Bearer ' + token } };
  await authMiddleware(ctx, noop);
  expect(ctx.user.email).toBe(email);
});

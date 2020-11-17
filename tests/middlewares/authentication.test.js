const signJWT = require('../../utils/signJWT');
const authMiddleware = require('../../middleware/authentication');
const { Student } = require('../../models').models;

const noop = () => {};
const email = 'pippo@poppi.it';

beforeAll(() => {
  console.dir(Student);
  return Student.create({ firstName: 'Pippo', lastName: 'Pluto', email });
});

afterAll(() => {
  return Student.destroy({ where: { email } });
});

// unit tests
test('authentication works', async function() {
  const student = await Student.findOne({ where: { email } });
  const token = signJWT({ id: student.id, userType: 'student' });
  const ctx = { header: { authorization: 'Bearer ' + token } };
  await authMiddleware(ctx, noop);
  expect(ctx.user.email).toBe(email);
});

const r2 = require('r2');

const baseUrl = 'http://localhost:3000/api/v1/users';

function sum(a, b) {
  return a + b;
}

// unit tests
test('1 + 2 equals 3', function() {
  expect(sum(1, 2)).toBe(3);
});

// API tests
test('api test', async () => {
  const data = await r2(baseUrl).json;
  expect(data.length).toBe(3);
});

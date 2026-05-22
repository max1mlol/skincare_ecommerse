'use strict';

const { pool } = require('../src/config/db');

const TEST_PASSWORD = 'TestPass1!';

function uniqueUser() {
  const n = Date.now() + Math.floor(Math.random() * 10000);
  return {
    firstName: 'Test',
    lastName: 'User',
    phone: String(90000000 + (n % 9000000)),
    email: `test_${n}@auraskin.test`,
    password: TEST_PASSWORD,
  };
}

async function cleanupTestUsers(emailPattern = '%@auraskin.test') {
  await pool.query(
    `DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    [emailPattern]
  );
  await pool.query(
    `DELETE FROM reviews WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    [emailPattern]
  );
  await pool.query(`DELETE FROM users WHERE email LIKE $1`, [emailPattern]);
}

module.exports = { TEST_PASSWORD, uniqueUser, cleanupTestUsers };

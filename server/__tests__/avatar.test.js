'use strict';

const path = require('node:path');
const fs = require('node:fs');
const request = require('supertest');
const app = require('../src/index');
const { uniqueUser, cleanupTestUsers, closeTestDb } = require('./helpers');

const FIXTURE = path.join(__dirname, 'fixtures', 'test-avatar.png');

describe('POST /api/users/:id/avatar', () => {
  beforeAll(() => {
    if (!fs.existsSync(FIXTURE)) {
      throw new Error(`Missing test fixture: ${FIXTURE}`);
    }
  });

  beforeEach(() => cleanupTestUsers());
  afterAll(async () => {
    await cleanupTestUsers();
    await closeTestDb();
  });

  it('uploads avatar and returns updated user (success)', async () => {
    const u = uniqueUser();
    const reg = await request.agent(app).post('/api/auth/register').send(u).expect(201);
    const userId = reg.body.user.id;
    const cookies = reg.headers['set-cookie'];

    const res = await request(app)
      .post(`/api/users/${userId}/avatar`)
      .set('Cookie', cookies)
      .attach('avatar', FIXTURE)
      .expect(200);

    expect(res.body.user.avatar_url).toMatch(/\/uploads\/avatars\//);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    expect(me.body.user.avatar_url).toBe(res.body.user.avatar_url);
  });

  it('returns 401 without session (error)', async () => {
    const res = await request(app)
      .post('/api/users/00000000-0000-0000-0000-000000000001/avatar')
      .expect(401);
    expect(res.body.error).toMatch(/нэвтрэх/i);
  });

  it('returns 400 when no file sent (error)', async () => {
    const u = uniqueUser();
    const reg = await request.agent(app).post('/api/auth/register').send(u);
    const cookies = reg.headers['set-cookie'];

    await request(app)
      .post(`/api/users/${reg.body.user.id}/avatar`)
      .set('Cookie', cookies)
      .expect(400);
  });
});

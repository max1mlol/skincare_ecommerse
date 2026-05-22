'use strict';

const request = require('supertest');
const app = require('../src/index');
const { hashPassword, verifyPassword } = require('../src/routes/auth');
const { query: db } = require('../src/config/db');
const { TEST_PASSWORD, uniqueUser, cleanupTestUsers, closeTestDb } = require('./helpers');

const agent = () => request.agent(app);

describe('hashPassword / verifyPassword', () => {
  it('creates distinct salt and hash per call', async () => {
    const a = await hashPassword('Secret1!');
    const b = await hashPassword('Secret1!');
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
    expect(a.hash).toHaveLength(60);
    expect(a.salt).toHaveLength(64);
  });

  it('verifyPassword returns true for correct password', async () => {
    const { hash, salt } = await hashPassword(TEST_PASSWORD);
    expect(await verifyPassword(TEST_PASSWORD, hash, salt)).toBe(true);
  });

  it('verifyPassword returns false for wrong password', async () => {
    const { hash, salt } = await hashPassword(TEST_PASSWORD);
    expect(await verifyPassword('WrongPass1!', hash, salt)).toBe(false);
  });
});

describe('POST /api/auth/register', () => {
  beforeAll(() => cleanupTestUsers());
  afterAll(() => cleanupTestUsers());

  it('registers a new user and sets session (success)', async () => {
    const u = uniqueUser();
    const res = await agent()
      .post('/api/auth/register')
      .send(u)
      .expect(201);

    expect(res.body.user.email).toBe(u.email);
    expect(res.body.user.role).toBe('customer');
    expect(res.headers['set-cookie']).toBeDefined();

    const { rows } = await db(
      'SELECT password_hash, salt FROM users WHERE email = $1',
      [u.email]
    );
    expect(rows[0].password_hash).toBeTruthy();
    expect(rows[0].salt).toBeTruthy();
    expect(await verifyPassword(u.password, rows[0].password_hash, rows[0].salt)).toBe(true);
  });

  it('returns 400 when password is too weak (error)', async () => {
    const u = uniqueUser();
    const res = await agent()
      .post('/api/auth/register')
      .send({ ...u, password: 'weak' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  it('returns 409 when email is duplicate (error)', async () => {
    const u = uniqueUser();
    await agent().post('/api/auth/register').send(u).expect(201);
    const res = await agent()
      .post('/api/auth/register')
      .send({ ...uniqueUser(), email: u.email, phone: uniqueUser().phone })
      .expect(409);

    expect(res.body.error).toMatch(/бүртгэгдсэн/i);
  });
});

describe('POST /api/auth/login', () => {
  const u = uniqueUser();

  beforeAll(async () => {
    await cleanupTestUsers();
    await agent().post('/api/auth/register').send(u);
  });
  afterAll(() => cleanupTestUsers());

  it('logs in with valid credentials (success)', async () => {
    const res = await agent()
      .post('/api/auth/login')
      .send({ identifier: u.email, password: u.password })
      .expect(200);

    expect(res.body.user.email).toBe(u.email);
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 for wrong password (error)', async () => {
    const res = await agent()
      .post('/api/auth/login')
      .send({ identifier: u.email, password: 'WrongPass1!' })
      .expect(401);

    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when identifier is missing (error)', async () => {
    const res = await agent()
      .post('/api/auth/login')
      .send({ password: u.password })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });
});

describe('POST /api/auth/logout', () => {
  const u = uniqueUser();

  beforeAll(async () => {
    await cleanupTestUsers();
    await agent().post('/api/auth/register').send(u);
  });
  afterAll(() => cleanupTestUsers());

  it('logs out and clears session (success)', async () => {
    const jar = agent();
    await jar.post('/api/auth/login').send({ identifier: u.email, password: u.password });

    await jar.post('/api/auth/logout').expect(200);
    const me = await jar.get('/api/auth/me').expect(401);
    expect(me.body.user).toBeNull();
  });

  it('returns 401 when not authenticated (error)', async () => {
    await agent().post('/api/auth/logout').expect(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without session', async () => {
    const res = await agent().get('/api/auth/me').expect(401);
    expect(res.body.user).toBeNull();
  });
});

afterAll(async () => {
  await closeTestDb();
});

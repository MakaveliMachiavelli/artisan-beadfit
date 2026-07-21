import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './auth';
import { prisma } from '../db/client';

// Set up a test express app
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth API Endpoints', () => {
  beforeEach(async () => {
    // Clean up users and sessions before each test
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'securepassword123',
        name: 'New User'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body.user.role).toBe('CUSTOMER');
    expect(res.headers['set-cookie']).toBeDefined();
    
    // Ensure the cookie is correctly configured
    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toContain('serene_session=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('should fail registration with invalid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'short'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should prevent duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already in use');
  });

  it('should login an existing user', async () => {
    // 1. Register
    await request(app).post('/api/auth/register').send({
      email: 'login@example.com',
      password: 'password123'
    });

    // 2. Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('login@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'wrongpw@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrongpw@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should fetch current user profile when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'me@example.com',
      password: 'password123'
    });

    const cookie = regRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('me@example.com');
  });

  it('should deny profile access when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should logout and invalidate session', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'logout@example.com',
      password: 'password123'
    });
    const cookie = regRes.headers['set-cookie'];

    // 1. Check me works
    let meRes = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(meRes.status).toBe(200);

    // 2. Logout
    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers['set-cookie'][0]).toContain('serene_session=;');

    // 3. Me should fail since session is deleted from db
    meRes = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(meRes.status).toBe(401);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index.js'; // Ensure this exports your express instance

describe('Auth Integration', () => {
  it('should register a new user and create a wallet', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password' });
    
    expect(res.statusCode).toBe(201);
  });

  it('should deny access to /me without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
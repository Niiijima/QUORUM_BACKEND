const request = require('supertest');
const app = require('../../index'); // Adjust path based on your folders

describe('GET /', () => {
  it('should respond with Hello world', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello world');
  });
});
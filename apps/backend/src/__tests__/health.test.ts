import request from 'supertest';

import { app } from '../app.js';

describe('Health Check Endpoint', () => {
  it('GET /health returns 200 OK', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.status).toBe(200);
  });

  it('response contains status ok', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('response contains valid timestamp', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('string');

    const timestamp = new Date(response.body.timestamp);
    expect(Number.isNaN(timestamp.getTime())).toBe(false);
    expect(response.body.timestamp).toBe(timestamp.toISOString());
  });
});

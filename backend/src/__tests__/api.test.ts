import express from 'express';
import request from 'supertest';
import apiRoutes from '../routes/api';

// Mock Firebase Admin
jest.mock('../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] })
  }
}));

// Mock Auth Middleware to bypass authentication during testing
jest.mock('../middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.factoryId = 'test-factory';
    req.role = 'OWNER';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('GET /api/dashboard', () => {
  it('should return 200 and basic dashboard data', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('factory');
    expect(res.body).toHaveProperty('hero');
    expect(res.body).toHaveProperty('kpis');
    expect(res.body).toHaveProperty('notifications');
  });
});

describe('GET /api/machines', () => {
  it('should return 200 and a list of machines', async () => {
    const res = await request(app).get('/api/machines');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });
});

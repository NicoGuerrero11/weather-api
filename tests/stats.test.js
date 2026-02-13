import request from 'supertest';
import express from 'express';
import weatherRoutes from '../routes/weather.js';
import { connectRedis } from '../config/redisClient.js';

const app = express();
app.use('/', weatherRoutes);

describe('GET /stats', () => {
    beforeAll(async () => {
        // Conectar a Redis antes de los tests
        await connectRedis();
    });

    it('should return stats with correct structure', async () => {
        const res = await request(app).get('/stats');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('cacheHits');
        expect(res.body).toHaveProperty('cacheMisses');
        expect(res.body).toHaveProperty('hitRate');
        expect(res.body).toHaveProperty('totalKeys');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('redisConnected');
        expect(res.body).toHaveProperty('errors');
        expect(res.body).toHaveProperty('timestamp');
    });

    it('should have numeric values for hits and misses', async () => {
        const res = await request(app).get('/stats');

        expect(typeof res.body.cacheHits).toBe('number');
        expect(typeof res.body.cacheMisses).toBe('number');
        expect(typeof res.body.totalKeys).toBe('number');
        expect(typeof res.body.errors).toBe('number');
    });

    it('should have hitRate as percentage string', async () => {
        const res = await request(app).get('/stats');

        expect(res.body.hitRate).toMatch(/^\d+\.\d+%$/);
    });

    it('should show Redis connection status', async () => {
        const res = await request(app).get('/stats');

        expect(typeof res.body.redisConnected).toBe('boolean');
    });
});
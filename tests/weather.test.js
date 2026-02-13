import request from 'supertest';
import express from 'express';
import weatherRoutes from '../routes/weather.js';
import { connectRedis, client, cacheStats } from '../config/redisClient.js';

const app = express();
app.use('/', weatherRoutes);

describe('GET /:city', () => {
    beforeAll(async () => {
        await connectRedis();
        // Limpiar cache antes de tests
        if (client.isReady) {
            await client.flushAll();
        }
    });

    afterAll(async () => {
        // Cerrar conexión después de tests
        if (client.isReady) {
            await client.quit();
        }
        // Dar tiempo para que la conexión se cierre completamente
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should return 400 if no city is provided', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(404); // Express responde 404 en ruta no definida
    });

    it('should fetch weather data for a valid city', async () => {
        const res = await request(app).get('/London');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('source');
        expect(res.body).toHaveProperty('cached');
    });

    it('should return cached: false on first request (cache MISS)', async () => {
        // Limpiar cache primero
        if (client.isReady) {
            await client.del('paris');
        }

        const res = await request(app).get('/Paris');

        expect(res.status).toBe(200);
        expect(res.body.cached).toBe(false);
        expect(res.body.source).toBe('api');
    });

    it('should return cached: true on second request (cache HIT)', async () => {
        // Primera request para cachear
        await request(app).get('/Berlin');

        // Segunda request debería venir del cache
        const res = await request(app).get('/Berlin');

        expect(res.status).toBe(200);
        expect(res.body.cached).toBe(true);
        expect(res.body.source).toBe('cache');
    });

    it('should increment cache stats correctly', async () => {
        const initialHits = cacheStats.hits;
        const initialMisses = cacheStats.misses;

        // Primera request (miss)
        await request(app).get('/Madrid');

        // Segunda request (hit)
        await request(app).get('/Madrid');

        expect(cacheStats.hits).toBeGreaterThan(initialHits);
        expect(cacheStats.misses).toBeGreaterThan(initialMisses);
    });

    it('should handle invalid city names gracefully', async () => {
        const res = await request(app).get('/InvalidCityName12345');

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});
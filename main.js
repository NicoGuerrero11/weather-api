import express from 'express';
import weather from './routes/weather.js';
import dotenv from 'dotenv';
import { port } from './config/config.js';
import { connectRedis } from './config/redisClient.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
app.disable('x-powered-by');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use('/', weather);

const connectServer = async () => {
    await connectRedis(); // Will continue even if Redis fails
    app.listen(port, () => {
        console.log(`🚀 Server listening on port ${port}`);
        console.log(`📊 Stats available at: http://localhost:${port}/stats`);
    });
};

connectServer();
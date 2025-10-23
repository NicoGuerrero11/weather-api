import express from 'express';
import weather from './routes/weather.js';
import dotenv from 'dotenv';
import {port} from './config/config.js';
import {connectRedis} from './config/redisClient.js'
import rateLimit from 'express-rate-limit'
dotenv.config();

const app = express();
app.disable('x-powered-by');


const limiter=rateLimit({
    windowMs:15*60*1000,
    max:100
})

app.use(limiter)
app.use('/', weather);

const connectServer = async () => {
    await connectRedis();
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })
}

connectServer();

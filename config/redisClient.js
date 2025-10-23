import dotenv from 'dotenv';
import { createClient } from 'redis';


dotenv.config();


export const client = createClient({
    username: process.env.REDIS_USERNAME ,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
});

client.on('error', err => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    try{
        await client.connect();
        console.log('Redis Connected');
    }catch(e){
        console.error('Redis Connect Failed', e);
        process.exit(1);
    }
}


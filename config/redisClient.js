import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

// Cache statistics
// se reinician cada vez que el server se reinicia
export const cacheStats = {
    hits: 0,
    misses: 0,
    startTime: Date.now(),
    errors: 0
};

// Increment functions
export const incrementHit = () => cacheStats.hits++;
export const incrementMiss = () => cacheStats.misses++;
export const incrementError = () => cacheStats.errors++;

// Calculate hit rate
export const getHitRate = () => {
    const total = cacheStats.hits + cacheStats.misses;
    if (total === 0) return '0.0%';
    return ((cacheStats.hits / total) * 100).toFixed(1) + '%';
};

// Calculate uptime
export const getUptime = () => {
    const uptimeMs = Date.now() - cacheStats.startTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

// Redis client with fallback support
export const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }
});

// Connection state
let isRedisConnected = false;

client.on('error', err => {
    console.log('⚠️  Redis Client Error:', err.message);
    isRedisConnected = false;
    incrementError();
});

client.on('connect', () => {
    console.log('✅ Redis Connected');
    isRedisConnected = true;
});

client.on('disconnect', () => {
    console.log('❌ Redis Disconnected');
    isRedisConnected = false;
});

// Check if Redis is connected
export const isRedisReady = () => isRedisConnected && client.isReady;

// Connect to Redis with fallback
export const connectRedis = async () => {
    try {
        await client.connect();
        isRedisConnected = true;
        console.log('✅ Redis Connected Successfully');
    } catch (e) {
        console.error('⚠️  Redis Connection Failed:', e.message);
        console.log('🔄 Server will continue without caching');
        isRedisConnected = false;
        // DON'T exit - continue without Redis
    }
};

// Safe Redis operations with fallback
export const safeGet = async (key) => {
    if (!isRedisReady()) {
        console.log('⚠️  Redis not available, skipping cache read');
        return null;
    }
    try {
        return await client.get(key);
    } catch (err) {
        console.error('⚠️  Redis GET error:', err.message);
        incrementError();
        return null;
    }
};

export const safeSet = async (key, value, ttl = 3600) => {
    if (!isRedisReady()) {
        console.log('⚠️  Redis not available, skipping cache write');
        return false;
    }
    try {
        await client.set(key, value, 'EX', ttl);
        return true;
    } catch (err) {
        console.error('⚠️  Redis SET error:', err.message);
        incrementError();
        return false;
    }
};

export const safeDel = async (key) => {
    if (!isRedisReady()) return false;
    try {
        await client.del(key);
        return true;
    } catch (err) {
        console.error('⚠️  Redis DEL error:', err.message);
        incrementError();
        return false;
    }
};

export const safeDbSize = async () => {
    if (!isRedisReady()) return 0;
    try {
        return await client.dbSize();
    } catch (err) {
        console.error('⚠️  Redis DBSIZE error:', err.message);
        return 0;
    }
};
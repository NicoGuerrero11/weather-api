import getWeather from "../model/weather.js";
import {
    cacheStats,
    getHitRate,
    getUptime,
    isRedisReady,
    safeDbSize
} from '../config/redisClient.js';

// Existing weather controller
const weather = async (req, res) => {
    const { city } = req.params;
    try {
        if (!city) {
            return res.status(400).send({ error: "you must specify a city" });
        }
        const result = await getWeather(city);
        return res.status(200).send(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// NEW: Stats endpoint
export const getStats = async (req, res) => {
    try {
        const totalKeys = await safeDbSize();

        const stats = {
            cacheHits: cacheStats.hits,
            cacheMisses: cacheStats.misses,
            hitRate: getHitRate(),
            totalKeys: totalKeys,
            uptime: getUptime(),
            redisConnected: isRedisReady(),
            errors: cacheStats.errors,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({
            error: 'Failed to retrieve stats',
            message: err.message
        });
    }
};

export default weather;
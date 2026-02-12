import { key } from '../config/config.js';
import axios from "axios";
import {
    safeGet,
    safeSet,
    incrementHit,
    incrementMiss
} from '../config/redisClient.js';

const requestThirdParty = async (city) => {
    const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${key}&contentType=json`;
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (err) {
        console.error('API Error:', err.message);
        throw new Error("Failed to fetch weather data from API");
    }
};

const getCachedWeather = async (city) => {
    try {
        const getCache = await safeGet(city);
        return getCache ? JSON.parse(getCache) : null;
    } catch (err) {
        console.error('Cache Read Error:', err.message);
        return null; // Fallback: return null if cache read fails
    }
};

const setCachedWeather = async (city, data) => {
    try {
        await safeSet(city, JSON.stringify(data), 3600);
    } catch (err) {
        console.error('Cache Write Error:', err.message);
        // Don't throw - just log and continue
    }
};

const getWeather = async (city) => {
    try {
        // Try to get from cache
        const data = await getCachedWeather(city);

        if (data) {
            incrementHit(); // Track cache hit
            console.log(`✅ Cache HIT for ${city}`);
            return {
                data: data,
                source: 'cache'
            };
        }

        // Cache miss - fetch from API
        incrementMiss(); // Track cache miss
        console.log(`❌ Cache MISS for ${city} - fetching from API`);

        const cityData = await requestThirdParty(city);
        await setCachedWeather(city, cityData);

        console.log(`💾 Data for ${city} cached successfully`);
        return {
            data: cityData,
            source: 'api'
        };
    } catch (err) {
        console.error('Get Weather Error:', err.message);
        throw new Error("Failed to get weather data");
    }
};

export default getWeather;
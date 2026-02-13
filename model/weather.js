import axios from "axios";
import {
    safeGet,
    safeSet,
    incrementHit,
    incrementMiss
} from '../config/redisClient.js';

// CAMBIO: Usar OpenWeather en vez de Visual Crossing
const requestThirdParty = async (city) => {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
        throw new Error("WEATHER_API_KEY not configured in .env");
    }

    // OpenWeather API endpoint
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        console.log(`🌐 Fetching weather for ${city} from OpenWeather API...`);
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (err) {
        console.error('API Error:', err.message);

        if (err.response?.status === 401) {
            throw new Error("Invalid API key. Check your WEATHER_API_KEY in .env");
        }

        if (err.response?.status === 404) {
            throw new Error(`City "${city}" not found`);
        }

        throw new Error("Failed to fetch weather data from API");
    }
};

const getCachedWeather = async (city) => {
    try {
        const getCache = await safeGet(city.toLowerCase());
        return getCache ? JSON.parse(getCache) : null;
    } catch (err) {
        console.error('Cache Read Error:', err.message);
        return null;
    }
};

const setCachedWeather = async (city, data) => {
    try {
        await safeSet(city.toLowerCase(), JSON.stringify(data), 3600);
    } catch (err) {
        console.error('Cache Write Error:', err.message);
    }
};

const getWeather = async (city) => {
    try {
        // Normalize city name (lowercase)
        const normalizedCity = city.toLowerCase();

        // Try to get from cache
        const data = await getCachedWeather(normalizedCity);

        if (data) {
            incrementHit();
            console.log(`✅ Cache HIT for ${city}`);
            return {
                data: data,
                source: 'cache',
                cached: true
            };
        }

        // Cache miss - fetch from API
        incrementMiss();
        console.log(`❌ Cache MISS for ${city} - fetching from API`);

        const cityData = await requestThirdParty(city);
        await setCachedWeather(normalizedCity, cityData);

        console.log(`💾 Data for ${city} cached successfully`);
        return {
            data: cityData,
            source: 'api',
            cached: false
        };
    } catch (err) {
        console.error('Get Weather Error:', err.message);
        throw new Error(err.message || "Failed to get weather data");
    }
};

export default getWeather;
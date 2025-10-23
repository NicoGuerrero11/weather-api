import {key} from '../config/config.js'
import axios from "axios";
import {client} from '../config/redisClient.js'

const requestThirdParty = async (city) => {
    const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${key}&contentType=json`;
    try{
        const response = await axios.get(apiUrl);
        return response.data;
    }catch(err){
        console.error(err);
        throw new Error("Failed to fetch weather data from API");
    }
}

const getCachedWeather = async (city) => {
    try{
        const getCache = await client.get(city);
        return getCache ? JSON.parse(getCache) : null;
    }catch(err){
        console.error(err);
        throw new Error("Failed to get weather data from cache");
    }
}

const setCachedWeather = async (city, data) => {
    try{
        await client.set(city, JSON.stringify(data), 'EX', 3600);
    }catch(err){
        console.error(err);
        throw new Error("Failed to set weather data from cache");
    }
}

const getWeather = async (city) => {
    try{
        const data = await getCachedWeather(city);
        if (data){
            console.log(`Data for ${city} fetched from Redis cache.`);
            return {data: data};
        }
        const cityData = await requestThirdParty(city);
        await setCachedWeather(city, cityData);
        console.log(`Data for ${city} fetched from API and saved to Redis cache.`);
        return {data: cityData};
    }catch(err){
        console.error(err);
        throw new Error("Failed to get weather data");
    }
}

export default getWeather;
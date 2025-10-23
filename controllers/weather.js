import getWeather from "../model/weather.js";

const weather = async (req, res) => {
    const {city} = req.params;
    try{
        if (!city) return res.status(400).send({error: "you must specify a city"});
        const result = await getWeather(city);
        return res.status(200).send(result);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

export default weather;
// {NOTE: Imported dotenv here because in the import chain weather.service.js gets imported first then index.js and environment variables are not available during that time}
import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { ApiError } from "../utils/apiError.js";

const OPEN_WEATHER_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = process.env.OPENWEATHER_API_KEY;

const getCurrentWeather = async (city, units = "metric") => {
  try {
    const response = await axios.get(`${OPEN_WEATHER_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units,
      },
    });

    const currentData = {
      city: response.data.name,
      country: response.data.sys.country,
      timezone: response.data.timezone,
      coordinates: response.data.coord,
      weather: {
        main: response.data.weather[0].main,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
      },
      temperature: {
        current: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        min: response.data.main.temp_min,
        max: response.data.main.temp_max,
      },
      wind: {
        speed: response.data.wind.speed,
        direction: response.data.wind.deg,
      },
      pressure: response.data.main.pressure,
      humidity: response.data.main.humidity,
    };

    return currentData;
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Error fetching current  weather data"
    );
  }
};

const getWeatherForecast = async (city, units = "metric", days = 3) => {
  try {
    const response = await axios.get(`${OPEN_WEATHER_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units,
        cnt: days * 8,
      },
    });

    const forecastData = response.data.list.map((item) => ({
      date: item.dt_txt,
      weather: item.weather[0].description,
      temp: {
        min: item.main.temp_min,
        max: item.main.temp_max,
        current: item.main.temp,
      },
      feels_like: item.main.feels_like,
      wind_speed: item.wind.speed,
      humidity: item.main.humidity,
      weather_icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
    }));

    return forecastData;
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Failed to fetch weather forecast data"
    );
  }
};

export { getCurrentWeather, getWeatherForecast };

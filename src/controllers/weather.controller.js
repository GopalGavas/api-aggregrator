import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  getCurrentWeather,
  getWeatherForecast,
} from "../services/weather.service.js";
import { User } from "../models/user.models.js";

const fetchCurrentWeather = asyncHandler(async (req, res) => {
  const { city, units } = req.query;

  if (!city) {
    throw new ApiError(
      400,
      "City name is required for fetching Current Weather Data"
    );
  }

  const validUnits = ["metric", "imperial", "standard"];

  if (units && !validUnits.includes(units)) {
    throw new ApiError(
      400,
      "Invalid units parameter. Allowed units are 'metric', 'imperial', 'standard'"
    );
  }

  const weatherData = await getCurrentWeather(city, units || "metric");

  await User.findByIdAndUpdate(req.user?._id, {
    $inc: {
      "apiUsage.weather": 1,
    },

    $push: {
      activityLogs: {
        action: "FETCHED CURRENT WEATHER DATA",
        details: {
          city,
          units,
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, weatherData, "Current Weather fetched successfully")
    );
});

const fetchWeatherForecast = asyncHandler(async (req, res) => {
  const { city, units, days } = req.query;

  if (!city) {
    throw new ApiError(
      400,
      "City name is required for fetching Weather Forecast"
    );
  }

  const validUnits = ["metric", "imperial", "standard"];
  if (units && !validUnits.includes(units)) {
    throw new ApiError(
      400,
      "Invalid units parameter. Allowed units are 'metric', 'imperial', 'standard'"
    );
  }

  if ((days && isNaN(days)) || days < 1 || days > 7) {
    throw new ApiError(
      400,
      "Invalid 'days' parameter. Please provide a value between 1 and 7."
    );
  }

  const weatherForecast = await getWeatherForecast(
    city,
    units || "metric",
    days
  );

  await User.findByIdAndUpdate(req.user?._id, {
    $inc: {
      "apiUsage.weather": 1,
    },

    $push: {
      activityLogs: {
        action: "FETCHED WEATHER FORECAST",
        details: {
          city,
          units,
          days,
        },
      },
    },
  });

  console.log("WEATHER FORECAST FROM WEATHER CONTROLLER", weatherForecast);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        weatherForecast,
        "Weather Forecast fetched successfully"
      )
    );
});

export { fetchCurrentWeather, fetchWeatherForecast };

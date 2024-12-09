import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { ApiError } from "../utils/apiError.js";

const API_KEY = process.env.TOMTOM_API_KEY;
const BASE_URL =
  "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json";

console.log(API_KEY);

const getTrafficFlow = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        unit: "KMPH",
        point: `${lat},${lon}`,
        zoom: 10,
      },
    });
    console.log("URL TRAFFIC  FLOW", `${BASE_URL}/flowSegmentData`);

    console.log("RESPONSE DATA FROM TRAFFIC SERVICE: ", response);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Error fetching Taffic Flow data"
    );
  }
};

const getTrafficIncident = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/incidents`, {
      params: {
        key: API_KEY,
        lat,
        lon,
        radius: 1000,
      },
    });

    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Error fetching Taffic Incidents data"
    );
  }
};

export { getTrafficFlow, getTrafficIncident };

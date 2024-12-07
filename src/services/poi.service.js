import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { ApiError } from "../utils/apiError.js";

const API_KEY = process.env.OPENTRIMAP_API_KEY;

const api = axios.create({
  baseURL: "https://api.opentripmap.com/0.1/en/places",
  params: { apikey: API_KEY },
});

const geoCodePlace = async (placeName) => {
  const url = `/geoname?name=${placeName}`;

  try {
    const response = await api.get(url);

    const { lat, lon } = response.data;

    if (!lat || !lon) {
      throw new ApiError(400, "Invalid place name or coordinates not found");
    }

    return { lat, lon };
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Unable to geocode the place"
    );
  }
};

const getNearByPOIs = async (
  latitude,
  longitude,
  radius,
  kinds = "restaurants"
) => {
  const url = `/radius?lat=${latitude}&lon=${longitude}&radius=${radius}&kinds=${kinds}`;

  try {
    const response = await api.get(url);

    const pois = response.data.features.map((index) => ({
      name: index.properties.name,
      distance: index.properties.dist,
      kinds: index.properties.kinds.split(","),
      coordinates: {
        latitude: index.geometry.coordinates[1],
        longitude: index.geometry.coordinates[0],
      },
    }));

    return pois;
  } catch (error) {
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Unable to fetch the point of interest."
    );
  }
};

export { geoCodePlace, getNearByPOIs };

import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  fetchCurrentWeather,
  fetchWeatherForecast,
} from "../controllers/weather.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/current").get(fetchCurrentWeather);
router.route("/forecast").get(fetchWeatherForecast);

export default router;

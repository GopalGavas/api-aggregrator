import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  fetchTrafficFlow,
  fetchTrafficIncidents,
} from "../controllers/traffic.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/flow").get(fetchTrafficFlow);
router.route("/incidents").get(fetchTrafficIncidents);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { fetchNearByPOIs } from "../controllers/poi.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(fetchNearByPOIs);

export default router;

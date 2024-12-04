import { Router } from "express";
import {
  registerUser,
  updateDetails,
  changePassword,
  userLogin,
  userLogout,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(userLogin);

// "SECURED ROUTES"
router.route("/update-details").patch(verifyJWT, updateDetails);
router.route("/change-password").patch(verifyJWT, changePassword);
router.route("/logout").post(verifyJWT, userLogout);

export default router;

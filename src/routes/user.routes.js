import { Router } from "express";
import {
  registerUser,
  updateDetails,
  changePassword,
  userLogin,
  userLogout,
  getUserProfile,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(userLogin);

// "SECURED ROUTES"
router.use(verifyJWT);

router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(getUserProfile);
router.route("/update-details").patch(updateDetails);
router.route("/change-password").patch(changePassword);
router.route("/logout").post(userLogout);

export default router;

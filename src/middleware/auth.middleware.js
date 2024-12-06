import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid  Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(400, error.message || "Invalid Access Token");
  }
});

const isAdmin = asyncHandler(async (req, _, next) => {
  const { email } = req.user;

  const user = await User.findOne({ email });

  if (user.role !== "admin") {
    throw new ApiError(
      401,
      "You are not authorized for this action since you are not an admin"
    );
  }

  next();
});

export { verifyJWT, isAdmin };

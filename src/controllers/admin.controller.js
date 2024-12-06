import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";

const getAllUsers = asyncHandler(async (req, res) => {});

const getActivityLog = asyncHandler(async (req, res) => {
  const { userId } = req.params;
});

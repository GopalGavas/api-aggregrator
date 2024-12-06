import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefeshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Internal Server Error while generating Access and Refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "All fields are required for registration");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  await User.findByIdAndUpdate(user?._id, {
    $push: {
      activityLogs: {
        action: "REGISTER",
        details: { fullName, email },
      },
    },
  });

  const { password: _, refreshToken, ...createdUser } = user.toObject();

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required for Logging In");
  }

  const user = await User.findOne({ email }).select("-activityLogs");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefeshToken(
    user?._id
  );

  await User.findByIdAndUpdate(user?._id, {
    $push: {
      activityLogs: {
        action: "LOGGED-IN",
        details: { email },
      },
    },

    $set: {
      isActive: true,
    },
  });

  user.password = undefined;
  user.refreshToken = undefined;

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },

      $set: {
        isActive: false,
      },

      $push: {
        activityLogs: {
          action: "LOGGED OUT",
          details: {
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          },
        },
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefeshToken(user?._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken }, "Access Token Refreshed"));
  } catch (error) {
    throw new ApiError(400, error.message || "Invalid Refresh Token");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const {
    password = _,
    refreshToken,
    activityLogs,
    ...userProfile
  } = user.toObject();

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User Profile fetched successfully")
    );
});

const updateDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName && !email) {
    throw new ApiError(400, "Enter the fields which you want to update");
  }

  if (email) {
    const existingEmail = await User.findOne({ email });
    if (
      existingEmail &&
      existingEmail._id.toString() !== req.user?._id.toString()
    ) {
      throw new ApiError(400, "Email is already taken by another User");
    }
  }

  const user = await User.findById(req.user?._id);

  if (fullName) user.fullName = fullName;
  if (email) user.email = email;

  user.activityLogs.push({
    action: "UPDATED DETAILS",
    details: {
      ...(fullName && { updatedfield: "fullName" }),
      ...(email && { updatedfield: "email" }),
    },
  });

  await user.save({ validateBeforeSave: false });

  const {
    password: _,
    refreshToken,
    activityLogs,
    ...updatedUser
  } = user.toObject();

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User details updated successfully")
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(
      400,
      "Your Old Password and New Password is required to update the password"
    );
  }

  const user = await User.findById(req.user?._id);

  const verifyOldPassword = await user.isPasswordCorrect(oldPassword);

  if (!verifyOldPassword) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;

  user.activityLogs.push({
    action: "CHANGED_PASSWORD",
    details: {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully"));
});

export {
  registerUser,
  userLogin,
  userLogout,
  refreshAccessToken,
  getUserProfile,
  updateDetails,
  changePassword,
};

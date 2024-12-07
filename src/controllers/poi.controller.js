import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { geoCodePlace, getNearByPOIs } from "../services/poi.service.js";
import { User } from "../models/user.models.js";

const fetchNearByPOIs = asyncHandler(async (req, res) => {
  const { placeName, kinds, radius = 5000 } = req.query;

  if (!placeName) {
    throw new ApiError(400, "Name of the place is required for searching POIs");
  }

  if (!kinds) {
    throw new ApiError(
      400,
      "Enter the kinds of Points of Interest you wanna search...eg: museums, parks etc..."
    );
  }

  const { lat, lon } = await geoCodePlace(placeName);

  const nearByPois = await getNearByPOIs(lat, lon, radius, kinds);

  await User.findByIdAndUpdate(req.user?._id, {
    $inc: {
      "apiUsage.poi": 1,
    },

    $push: {
      activityLogs: {
        action: "FETCH NEARBY POINT OF INTERESTS",
        details: {
          placeName,
          kinds,
          radius,
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        nearByPois,
        "Points of Interests fetched successfully"
      )
    );
});

export { fetchNearByPOIs };

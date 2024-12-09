import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  getTrafficFlow,
  getTrafficIncident,
} from "../services/traffic.service.js";
import { geoCodePlace } from "../services/poi.service.js";
import { User } from "../models/user.models.js";

const fetchTrafficFlow = asyncHandler(async (req, res) => {
  const {
    placeName,
    zoom = 10,
    units = "KMPH",
    page = 1,
    limit = 10,
  } = req.query;

  if (!placeName) {
    throw new ApiError(
      400,
      "Placename is required for fetchind the traffic incidents"
    );
  }

  const { lat, lon } = await geoCodePlace(placeName);

  const trafficFlow = await getTrafficFlow(lat, lon);

  // Handler pagination for coordinates
  const coordinates =
    trafficFlow?.flowSegmentData?.coordinates?.coordinate || [];
  const totalCount = coordinates.length;
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  const paginatedCoordinates = coordinates.slice(skip, skip + limit);

  const responseData = {
    trafficDetails: {
      currentSpeed: trafficFlow?.flowSegmentData?.currentSpeed,
      freeFlowSpeed: trafficFlow?.flowSegmentData?.freeFlowSpeed,
      currentTravelTime: trafficFlow?.flowSegmentData?.currentTravelTime,
      freeFlowTravelTime: trafficFlow?.flowSegmentData?.freeFlowTravelTime,
      confidence: trafficFlow?.flowSegmentData?.confidence,
      roadClosure: trafficFlow?.flowSegmentData?.roadClosure,
      frc: trafficFlow?.flowSegmentData?.frc,
    },
    coordinates: paginatedCoordinates,
    pagination: {
      totalCount,
      currentPage: parseInt(page, 10),
      totalPages,
      limit: parseInt(limit, 10),
    },
  };

  await User.findByIdAndUpdate(req.user?._id, {
    $inc: {
      "apiUsage.traffic": 1,
    },

    $push: {
      activityLogs: {
        action: "FETCH TRAFFIC FLOW",
        details: {
          placeName,
          zoom,
          units,
          page,
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseData,
        "Traffic Flow data fetched successfully"
      )
    );
});

const fetchTrafficIncidents = asyncHandler(async (req, res) => {
  const { placeName, radius = 1000 } = req.query;

  if (!placeName) {
    throw new ApiError(
      400,
      "Placename is required for fetchind the traffic flow"
    );
  }

  const { lat, lon } = await geoCodePlace(placeName);

  const trafficIncidents = await getTrafficIncident(lat, lon);

  await User.findByIdAndUpdate(req.user?._id, {
    $inc: {
      "apiUsage.traffic": 1,
    },

    $push: {
      activityLogs: {
        action: "FETCH TRAFFIC INCIDENTS",
        details: {
          placeName,
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
        trafficIncidents,
        "Traffic Incident data fetched successfully"
      )
    );
});

export { fetchTrafficFlow, fetchTrafficIncidents };

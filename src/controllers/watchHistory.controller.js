import User from "../Models/user.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const SaveWatchHistory = asyncHandler(async (req, res) => {
  const UserID = req.user._id;
  const { VideoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(UserID)) {
    throw new ApiError(400, "UserId is not valid");
  }

  if (!mongoose.Types.ObjectId.isValid(VideoId)) {
    throw new ApiError(400, "VideoId is not valid");
  }

  const WatchHistory = await User.findByIdAndUpdate(
    {
      _id: UserID,
    },
    {
      $addToSet: {
        WatchHistory: VideoId,
      },
    },
    {
      new: true,
    }
  );

  if (!WatchHistory) {
    throw new ApiError(500, "WatchHistory video couldn`t be saved");
  }

  res
    .status(200)
    .json(
      new ApiResponse(WatchHistory, 200, "Watch History saved Successfully")
    );
});


export {SaveWatchHistory}
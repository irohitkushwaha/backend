import User from "../Models/user.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../Models/video.model.js";

const SaveWatchHistory = asyncHandler(async (req, res) => {
  const UserID = req.user._id;
  const { VideoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(UserID)) {
    throw new ApiError(400, "UserId is not valid");
  }

  if (!mongoose.Types.ObjectId.isValid(VideoId)) {
    throw new ApiError(400, "VideoId is not valid");
  }

  const ExistVideoId = await Video.findById(VideoId);
  if (!ExistVideoId) {
    throw new ApiError(400, "Video id is not correct");
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

//Algorithm for geting watch history in which list of videos have to send
//1. take the logged user id from req.user._id
//2. check if user id is valid
//3. use aggregation pipeline
//4. filter by matching the userid
//5. use $lookup to join the watchhistory to video collection, match the video id of watch history in video id of video collection
//6. use sub pipeline and $project to get specific field such as title, description, thumbnail,views
//7. use $project at the root levele of pipeline
//8. send response to the client

const GetWatchHistory = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "userid is not valid");
  }

  const sendWatchHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userid),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "WatchHistory",
        foreignField: "_id",
        as: "WatchHistory",
        pipeline: [
          {
            $project: {
              Title: 1,
              Description: 1,
              views: 1,
              Duration: 1,
              Thumbnail: 1,
              Owner: 1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "Owner",
              foreignField: "_id",
              as: "Owner",
              pipeline: [
                {
                  $project: {
                    FullName: 1,
                    Avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$Owner",
          },
        ],
      },
    },
    {
      $project: {
        WatchHistory: 1,
      },
    },
  ]);

  if (!sendWatchHistory) {
    throw new ApiError(
      500,
      "something went wrong while fetching videos for watch History"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        sendWatchHistory,
        200,
        "videos for watch history fetched successfully"
      )
    );
});

export { SaveWatchHistory, GetWatchHistory };

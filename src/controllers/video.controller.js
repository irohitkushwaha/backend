import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import UploadOnCloudinary from "../utils/cloudinary.js";
import { Video } from "../Models/video.model.js";
import mongoose from "mongoose";

//algorithm to upload the video url as well as thumbnail url on database
//1. use multer middleware in routing for uploading the video and thumbnail temporarily on local server
//2. after uploading locally, get the upload form data such as title description from req.body (make sure available) and video & thumbnail url from multer req.file
//3. save the data on database in video document using create method
//4. after saving, send response to user

const VideoUpload = asyncHandler(async (req, res) => {
  const VideoFile = req.files?.Video?.[0]?.path;
  const Thumbnail = req.files?.Thumbnail?.[0]?.path;

  if (!VideoFile) {
    throw new ApiError(400, "Video is not found, upload it");
  }
  if (!Thumbnail) {
    throw new ApiError(400, "Thumbnail is not found, upload it");
  }

  const { Title, Description, PublishStatus, isShorts } = req.body;

  if ([Title, Description, PublishStatus].some((field) => !field)) {
    throw new ApiError(400, "Both title and description is required");
  }

  const VideoUploadOnCloudinary = await UploadOnCloudinary(VideoFile);
  const ThumbnailUploadOnCloudinary = await UploadOnCloudinary(Thumbnail);

  if (
    [VideoUploadOnCloudinary, ThumbnailUploadOnCloudinary].some(
      (field) => !field
    )
  ) {
    throw new ApiError(
      500,
      "Due to some issue, thumbnail or video can`t be uploaded on cloudinary"
    );
  }

  const UploadVideoDetails = await Video.create({
    Title: Title,
    Description: Description,
    VideoFile: VideoUploadOnCloudinary.url,
    Thumbnail: ThumbnailUploadOnCloudinary.url,
    Duration: VideoUploadOnCloudinary.duration,
    Owner: req.user._id,
    isPublished: PublishStatus,
    isShorts : isShorts
  });

  if (!UploadVideoDetails) {
    throw new ApiError(
      500,
      "Upload Video details can`t be uploaded on database"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(UploadVideoDetails, 200, "Video Uploaded successfully")
    );
});

//Algorithm for sending video list to homepage
//1. get page and limit query using req.query from frontend
//2. calculate skip using page and limit - skip = page -1 * limit
//3. start using mongodo aggregation pipeline of video document
//4. filter the video document by matching isPublished to true
//5. join the user document to match with the owner id by using $lookup
//6. use pipeline to above lookup to project only Fullname, Avatar
//7. use addfield to overwite for removing array or use $unwind to remove array
//8. sort the video by more views first, -1
//9. use skip to skip the items
//10. use limit to keep the no. of items
//11. use project to send only necessaery data
//12. count the video document using videoCount
//13. check has more
//14. finally send response to frontend

const GetVideosList = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const VideosList = await Video.aggregate([
    {
      $match: {
        isPublished: true,
        isShorts: false,
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
    {
      $project: {
        Thumbnail: 1,
        Title: 1,
        Owner: 1,
        views: 1,
        Duration: 1,
        isShorts : 1
      },
    },
    {
      $skip: skip,
    },
    {
      $sort: {
        views: -1,
      },
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  const TotalVideos = await Video.countDocuments({ isPublished: true });
  const HasMore = skip + limit < TotalVideos;

  res
    .status(200)
    .json(
      new ApiResponse(
        { VideosList, HasMore, page, limit, TotalVideos },
        200,
        "Video List Fetched Successfullly"
      )
    );
});

//get short video list
const GetShortsList = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const VideosList = await Video.aggregate([
    {
      $match: {
        isPublished: true,
        isShorts: true,
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
    {
      $lookup: {
        from: "subscriptions",
        localField: "Owner._id",
        foreignField: "Subscriber",
        as: "SubscribedTo",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "Owner._id",
        foreignField: "Channel",
        as: "Subscriber",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "Video",
        as: "VideoLikes",
      },
    },
    {
      $addFields: {
        VideoLikesCount: {
          $size: "$VideoLikes",
        },
        SubscribersCount: {
          $size: "$Subscriber",
        },
        SubscribedToCount: {
          $size: "$SubscribedTo",
        },
      },
    },
    {
      $project: {
        Title: 1, 
        Owner: 1,
        views: 1,
        VideoFile: 1,
        isShorts : 1,
        VideoLikesCount : 1,
        SubscribersCount : 1,
        SubscribedToCount : 1
      },
    },
    {
      $skip: skip,
    },
    {
      $sort: {
        views: -1,
      },
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  const TotalVideos = await Video.countDocuments({ isPublished: true });
  const HasMore = skip + limit < TotalVideos;

  res
    .status(200)
    .json(
      new ApiResponse(
        { VideosList, HasMore, page, limit, TotalVideos },
        200,
        "Video List Fetched Successfullly"
      )
    );
});

// Algorithm to Get Video and User Details with Subscriber Details Using videoID
// 1. Get videoID from request parameters
// 2. Validate if the videoID exists in the database; if not, throw an error
// 3. Use MongoDB aggregation pipeline on the Video collection
// 4. Filter the Video document using $match with the given videoID
// 5. Use $lookup to join the Owner field in the Video document with the User collection
//    to include owner details such as FullName and Avatar
// 6. Use a sub-pipeline in $lookup to join the User collection with the Subscription
//    collection to calculate the SubscriberCount for the owner
// 7. Use $addFields or $set to add the calculated SubscriberCount to the response
// 8. Use $project to select only the required fields such as Title, Thumbnail, Owner, and SubscriberCount
// 9. Send the final processed response back to the client

const GetVideoUserSubscriber = asyncHandler(async (req, res) => {
  const { VideoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(VideoId)) {
    throw new ApiError(400, "Video Id not found");
  }

  const VIDEO = await Video.findOneAndUpdate(
    {
      _id: VideoId,
    },
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!VIDEO) {
    throw new ApiError(400, "Video Not Found");
  }

  const SendVideoDetails = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(VIDEO._id),
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
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$Owner",
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "Owner._id",
        foreignField: "Subscriber",
        as: "SubscribedTo",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "Owner._id",
        foreignField: "Channel",
        as: "Subscriber",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "Video",
        as: "VideoLikes",
      },
    },
    {
      $addFields: {
        VideoLikesCount: {
          $size: "$VideoLikes",
        },
        SubscribersCount: {
          $size: "$Subscriber",
        },
        SubscribedToCount: {
          $size: "$SubscribedTo",
        },
      },
    },
    {
      $project: {
        VideoFile: 1,
        Title: 1,
        views: 1,
        Description: 1,
        Owner: 1,
        SubscribersCount: 1,
        SubscribedToCount: 1,
        VideoLikesCount: 1,
      },
    },
  ]);

  if (!SendVideoDetails.length) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SendVideoDetails,
        200,
        "Video details fetched successfully"
      )
    );
});

export { VideoUpload, GetVideosList, GetVideoUserSubscriber, GetShortsList };

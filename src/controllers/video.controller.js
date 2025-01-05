import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import UploadOnCloudinary from "../utils/cloudinary.js";
import { Video } from "../Models/video.model.js";

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

  const { Title, Description, PublishStatus } = req.body;

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
      },
    },
    {
      $skip: skip,
    },
    {
      $sort : {
        views : -1
      }
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

export { VideoUpload, GetVideosList };

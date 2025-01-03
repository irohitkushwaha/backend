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

  res.status(200).json(new ApiResponse(UploadVideoDetails, 200, "Video Uploaded successfully"));
});

export { VideoUpload };

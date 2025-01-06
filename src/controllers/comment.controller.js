import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {Video} from "../Models/video.model.js";
import { Tweet } from "../Models/tweet.model.js";
import {Comment} from "../Models/comment.model.js";

//algorithm for saving comment of video
//1. Take the content, owner (logged user), and videoId
//2. make sure content, owner, VideoId exist and valid videoId,
//3. save the comment in the database
//4. send response to the client

const SaveCommentOfVideo = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const content = req.body.content;
  const videoid = req.params.videoid;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not valid");
  }

  if (!mongoose.Types.ObjectId.isValid(videoid)) {
    throw new ApiError(400, "video id is not valid");
  }

  if (!content) {
    throw new ApiError(400, "content doesn`t exist");
  }

  const VIDEOID = await Video.findById(videoid);
  if (!VIDEOID) {
    throw new ApiError(400, "Video id doesn`t exist");
  }

  const SaveCommentOfVideo = await Comment.create({
    Content: content,
    Owner: userid,
    Video: VIDEOID._id,
  });

  if (!SaveCommentOfVideo) {
    throw new ApiError(500, "server error while saving comment of video");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SaveCommentOfVideo,
        200,
        "comment of video saved successfully"
      )
    );
});

//algorithm for saving comment of twitter
//1. Take the content, Owner (logged user), and tweet id from params
//2. make sure content exist, owner exist, tweet id exist
//3. save the comment in database
//4. send response to the client

const SaveCommentOfTwitter = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const TweetId = req.params.tweetid;
  const content = req.body.content;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not valid");
  }

  if (!mongoose.Types.ObjectId.isValid(TweetId)) {
    throw new ApiError(400, "tweet id is not valid");
  }
  if (!content) {
    throw new ApiError(400, "comment content of twitter doesn`t exist");
  }

  const TWEETID = await Tweet.findById(TweetId);

  if (!TWEETID) {
    throw new ApiError(400, "tweet id doesn`t exist");
  }

  const SaveCommentOfTweet = await Comment.create({
    Content: content,
    Tweet: TWEETID._id,
    Owner: userid,
  });

  if (!SaveCommentOfTweet) {
    throw new ApiError(500, "server error while saving comment of tweet");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SaveCommentOfTweet,
        200,
        "comment of tweet saved successfully"
      )
    );
});

export {SaveCommentOfTwitter, SaveCommentOfVideo}

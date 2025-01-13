import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../Models/video.model.js";
import { Tweet } from "../Models/tweet.model.js";
import { Comment } from "../Models/comment.model.js";
import { Likes } from "../Models/likes.model.js";

//Algorithm for saving like for video'
//1. take the video of likedby (logged user)
//2. take the video id from params
//3. validate both
//4. make sure both exist if not throw error
//5. create like document using these detail
//6. send response to the user

const SaveLikeForVideo = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const videoid = req.params.videoid;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not valid");
  }

  if (!mongoose.Types.ObjectId.isValid(videoid)) {
    throw new ApiError(400, "video id is not valid");
  }
  const VIDEOID = await Video.findById(videoid);
  if (!VIDEOID) {
    throw new ApiError(400, "Video id doesn`t exist");
  }

  const ExistLike = await Likes.findOne({
    Video: VIDEOID._id,
    Owner: userid,
  });

  if (ExistLike) {
    throw new ApiError(400, "user has been already liked this video");
  }

  const SaveLikeForVideo = await Likes.create({
    Video: VIDEOID._id,
    Owner: userid,
  });

  if (!SaveLikeForVideo) {
    throw new ApiError(500, "server error while saving like count for video");
  }

  res
    .status(200)
    .json(
      new ApiResponse(SaveLikeForVideo, 200, "like count saved successfully")
    );
});

//Algorithm for Saving like for comment
//1. take the likedby (logged in) of comment
//2. take the comment id from req.body
//3. validate both
//4. make sure comment id exist
//5. create a like document using user id and comment id

const SaveLikeForComment = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const CommentId = req.body.CommentId;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not in valid format");
  }

  const COMMENTID = await Comment.findById(CommentId);

  if (!COMMENTID) {
    throw new ApiError(400, "comment id doesn`t exist");
  }

  const ExistLike = await Likes.findOne({
    Comment: COMMENTID._id,
    Owner: userid,
  });

  if (ExistLike) {
    throw new ApiError(400, "User has been already liked this comment");
  }

  const SaveLikeForComment = await Likes.create({
    Comment: COMMENTID._id,
    Owner: userid,
  });

  if (!SaveLikeForComment) {
    throw new ApiError(500, "server error while saving like for comment");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SaveLikeForComment,
        200,
        "liked saved successfully for comment"
      )
    );
});

//Algorithm for Saving like for tweet
//1. Take the likedby (loggedin) of tweet
//2. Take the tweet id from body
//3. validate both
//4. create a document using tweet id and liked by id
//5. send response to user

const SaveLikedOfTweet = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const tweetid = req.body.tweetid;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not valid");
  }

  const TWEETID = await Tweet.findById(tweetid);

  if (!TWEETID) {
    throw new ApiError(400, "tweet id doesn`t exist");
  }

  const ExistLike = await Likes.findOne({
    Tweet: TWEETID._id,
    Owner: userid,
  });

  if (ExistLike) {
    throw new ApiError(400, "user has been already liked this tweet");
  }

  const SaveLikedOfTweet = await Likes.create({
    Tweet: TWEETID._id,
    Owner: userid,
  });

  if (!SaveLikedOfTweet) {
    throw new ApiError(400, "server error while saving liked of tweet");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SaveLikedOfTweet,
        200,
        "liked for tweet saved successfully"
      )
    );
});

//Algorithm for

export { SaveLikeForComment, SaveLikedOfTweet, SaveLikeForVideo };

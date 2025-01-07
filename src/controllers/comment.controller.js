import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../Models/video.model.js";
import { Tweet } from "../Models/tweet.model.js";
import { Comment } from "../Models/comment.model.js";

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

//Algorithm for sending comments of video
//1. get the video id from params and validate it, make sure exist
//2. get the page and limit from query
//3. calculate the skip
//4. start using aggregation pipeline
//5. use $match to filter comment document of that video id
//6. use $sort for newly created first
//7. use $lookup to get the user detail with owner
//8. use sub pipeline to project only avatar and full name
//9. Now, at the top level use $lookup to match the likes for comment with comment id
//9. use $addfield for likescountincomment
//10. use $project for sending api response
//11.send response to the use

const SendCommentsOfVideo = asyncHandler(async (req, res) => {
  const videoid = req.params.videoid;
  const { page, limit } = req.query;
  const VIDEOID = await Video.findById(videoid);
  if (!VIDEOID) {
    throw new ApiError(400, "Video id doesn`t exist");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const SendCommentsOfVideo = await Comment.aggregate([
    {
      $match: {
        Video: new mongoose.Types.ObjectId(VIDEOID._id),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    { $limit: parseInt(limit) },
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
        from: "likes",
        localField: "_id",
        foreignField: "Comment",
        as: "LikesForComment",
      },
    },
    {
      $addFields: {
        LikesCountForComment: {
          $size: "$LikesForComment",
        },
      },
    },
    {
      $project: {
        Content: 1,
        Video: 1,
        Owner: 1,
        LikesCountForComment: 1,
      },
    },
  ]);

  if (!SendCommentsOfVideo) {
    throw new ApiError(
      500,
      "Server error while finding comment for this video"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SendCommentsOfVideo,
        200,
        "Comment sent successfully for video"
      )
    );
});

//send comments to twitter
const SendCommentsOfTweet = asyncHandler(async (req, res) => {
  const { tweetid, page, limit } = req.query;
  const TWEETID = await Tweet.findById(tweetid);
  if (!TWEETID) {
    throw new ApiError(400, "Tweet id doesn`t exist");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const SendCommentsOfTweet = await Comment.aggregate([
    {
      $match: {
        Tweet: new mongoose.Types.ObjectId(TWEETID._id),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    { $limit: parseInt(limit) },
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
        from: "likes",
        localField: "_id",
        foreignField: "Comment",
        as: "LikesForTweet",
      },
    },
    {
      $addFields: {
        LikesCountForComment: {
          $size: "$LikesForTweet",
        },
      },
    },
    {
      $project: {
        Content: 1,
        Video: 1,
        Owner: 1,
        LikesCountForTweet: 1,
      },
    },
  ]);

  if (!SendCommentsOfTweet) {
    throw new ApiError(
      500,
      "Server error while finding comment for this tweet"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        SendCommentsOfTweet,
        200,
        "Comment sent successfully for this Tweet"
      )
    );
});

export { SaveCommentOfTwitter, SaveCommentOfVideo, SendCommentsOfVideo };

import User from "../Models/user.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Tweet } from "../Models/tweet.model.js";

//Algorithm for saving the tweet of a logged user
//1. Get the id of the owner of tweet using req.user._id
//2. get the content from the req.body
//3. validate the user id and content - exist
//4. Make sure the user id exist
//5. use the create operation on Tweet model to save the data
//6. send the response back to the frontend

const SaveTweet = asyncHandler(async (req, res) => {
  const userid = req.user._id;
  const content = req.body.Content.trim();

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not valid");
  }

  if (!content) {
    throw new ApiError(400, "content doesn`t exist");
  }

  const USERID = await User.findById(userid);

  if (!USERID) {
    throw new ApiError(400, "user id doesn`t exist");
  }

  const SaveTweet = await Tweet.create({
    Content: content,
    Owner: USERID,
  });

  if (!SaveTweet) {
    throw new ApiError(500, "server error during saving the tweet");
  }

  res
    .status(200)
    .json(new ApiResponse(SaveTweet, 200, "Tweet saved successfully"));
});

//algorithm for getting tweet

//1. get the user id of the channel from the params
//2. validate the user id
//3. make sure user id exist in the db
//4. find the user id in the tweet document,
//5. send response to the user

const GetTweet = asyncHandler(async (req, res) => {
  const userid = req.params.userid;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new ApiError(400, "user id is not in valid format");
  }

  const foundTweet = await Tweet.findOne({
    Owner: userid,
  });

  if (!foundTweet) {
    throw new ApiError(404, "tweet not available");
  }

  res
    .status(200)
    .json(new ApiResponse(foundTweet, 200, "Tweet fetched successfully"));
});

export { SaveTweet, GetTweet };

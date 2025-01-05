import User from "../Models/user.model.js";
import { Subscription } from "../Models/subscription.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../Models/video.model.js";
import mongoose from "mongoose";

//Algorithm for saving the subscriber data into subscription document, which id subscribed to which id
//1. take the user id through req.user._id who is subscribing
//2. take the user id who is being subscribed through req.params
//3. check their id exist in the user document or not, if not throw error
//4. check if already exist their user id in the subscription document, if exist throw error
//5. Now, save the both id in the subscription document using $set operator
//6. if not saved, throw error
//7. if saved then send response to the user

const SubscriberData = asyncHandler(async (req, res) => {
  const SubscriberId = req.user._id;
  const VideoId = req.params.VideoId;

  if (!mongoose.Types.ObjectId.isValid(SubscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }
  if (!mongoose.Types.ObjectId.isValid(VideoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const Subscriber = await User.findById({
    _id: SubscriberId,
  });

  const SubscribedTo = await Video.findOne({
    _id: VideoId,
  });

  if (!Subscriber) {
    throw new ApiError(400, "subscribing user doesn`t exist");
  }

  if (!SubscribedTo) {
    throw new ApiError(400, "Video doesn`t exist");
  }

  const SubscriptionExist = await Subscription.findOne({
    Subscriber: Subscriber._id,
    Channel: SubscribedTo.Owner,
  });

  if (SubscriptionExist) {
    throw new ApiError(400, "User has already subscribed");
  }

  const SaveSubscription = await Subscription.create({
    Subscriber: Subscriber._id,
    Channel: SubscribedTo.Owner,
  });

  res.status(200).json(new ApiResponse(SaveSubscription, 200, "Subscribed successfully"));
});

export {SubscriberData}





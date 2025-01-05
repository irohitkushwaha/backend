import User from "../Models/user.model";
import { Subscription } from "../Models/subscription.model";
import asyncHandler from "../utils/AsyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

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
  const ChannelId = req.params.ChannelId;

  const Subscriber = await User.findById({
    _id: SubscriberId,
  });

  const SubscribedTo = await User.findOne({
    UserName: SubscriberId,
  });

  if (!Subscriber) {
    throw new ApiError(400, "subscribing user doesn`t exist");
  }

  if (!SubscribedTo) {
    throw new ApiError(400, "Channel user doesn`t exist");
  }

  const SubscriptionExist = await Subscription.find({
    Subscriber: Subscriber._id,
    Channel: SubscribedTo._id,
  });

  if (SubscriptionExist) {
    throw new ApiError(400, "User has already subscribed");
  }

  const SaveSubscription = await Subscription.create({
    Subscriber: Subscriber._id,
    Channel: SubscribedTo._id,
  });

  res.status(200).json(new ApiResponse(SaveSubscription));
});





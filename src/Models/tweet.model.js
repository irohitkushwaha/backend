import mongoose, { Schema } from "mongoose";

const TweetSchema = new Schema(
  {
    Content: {
      type: String,
      required: true,
    },
    Owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Tweet = mongoose.model("Tweet", TweetSchema);

import mongoose, { Schema } from "mongoose";

const CommentSchema = Schema(
  {
    Content: {
      type: String,
      required: true,
    },
    Video: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
    },
    Tweet: {
      type: mongoose.Types.ObjectId,
      ref: "Tweet",
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

export const Comment = mongoose.model("Comment", CommentSchema);
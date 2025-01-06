import mongoose, { Schema } from "mongoose";

const CommentSchema = Schema(
  {
    content: {
      type: string,
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

export const comment = mongoose.model("comment", CommentSchema);
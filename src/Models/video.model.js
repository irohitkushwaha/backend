import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const VideoSchema = new Schema(
  {
    VideoFile: {
      type: String, //cloudniary
      required: true,
    },
    Thumbnail: {
      type: String, //cloudniary
      required: true,
    },
    views: {
      type: Number,
      default : 0
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    Owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    Duration: {
      type: String, // cloudniary
    },
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model("Video", VideoSchema);

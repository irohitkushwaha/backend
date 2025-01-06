import mongoose, { Schema, model } from "mongoose";

const LikeSchema = new Schema({
  Comment: { type: mongoose.Types.ObjectId, ref: "Comment" },

  Video: { type: mongoose.Types.ObjectId, ref: "Video" },

  Tweet: { type: mongoose.Types.ObjectId, ref: "Tweet" },

  Owner: { type: mongoose.Types.ObjectId, ref: "User" },
}, {
    timestamps : true
});

export const Likes = mongoose.model("Likes", LikeSchema);

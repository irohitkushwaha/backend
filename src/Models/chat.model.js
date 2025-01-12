import mongoose, { Schema } from "mongoose";

const ChatSchema = Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  MessageType: {
    type: String,
    enum: ["text", "Image", "PDF", "Video"],
  },
  MessageText: {
    type: String,
  },
  MessageFileUrl: {
    type: String,
  },
  MessageStatus: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  TimeStamps: {
    type: Date,
    default: Date.now,
  },
});

export const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;

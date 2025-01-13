import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.use(cookieParser());

import UserRouter from "./Routes/user.router.js";
app.use("/api/v1/register", UserRouter);

import VideoRouter from "./Routes/video.router.js";
app.use("/api/v1/video", VideoRouter);

import SubscriptionRouter from "./Routes/subscription.router.js";
app.use("/api/v1/subscription", SubscriptionRouter);

import SaveWatchHistoryRouter from "./Routes/watchhistory.router.js";

app.use("/api/v1/watchhistory", SaveWatchHistoryRouter);

//tweet routing

import TweetSaveRouters from "./Routes/tweet.router.js";
app.use("/api/v1/tweet", TweetSaveRouters);

//comment routing

import CommentRouting from "./Routes/comment.router.js";
app.use("/api/v1/comment", CommentRouting);

//likes router
import LikesRouting from "./Routes/likes.router.js";
app.use("/api/v1/likes", LikesRouting);

//socket setuping for chatting
import { SocketVerifyJwt } from "./Middlewares/socket.middleware.js";
import { HandleChat } from "./controllers/chat.controller.js";
import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: process.env.CORS_ORIGIN,
    // credentials: true,
    origin: "*",  // In production, set this to your specific client origin
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ["websocket"],
  path: "/socket.io/"
});

io.use(SocketVerifyJwt);
io.on("connection", (socket) => {
  console.log("Socket connected successfully! in server side", socket.id);

  HandleChat(socket, io);

  socket.on("disconnect", () => {
    console.log("Socket connection is disconnected");
  });
});



export {server};









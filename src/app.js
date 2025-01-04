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
export default app;

import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { GetShortsList, GetVideosList, GetVideoUserSubscriber, VideoUpload } from "../controllers/video.controller.js";

const router = Router();

router.route("/upload-video").post(
  VerifyJWT,
  upload.fields([
    {
      name: "Video",
      maxCount: 1,
    },
    {
      name: "Thumbnail",
      maxCount: 1,
    },
  ]),
  VideoUpload
);


//videoList sending

router.route("/videos-list").get(GetVideosList)

//Video sending with all details

router.route("/each-video/:VideoId").get(GetVideoUserSubscriber)

//short video sending in list with all detail

router.route("/shorts-list").get(GetShortsList)

export default router;




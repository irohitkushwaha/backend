import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { GetVideosList, VideoUpload } from "../controllers/video.controller.js";

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
export default router;

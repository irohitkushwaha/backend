import { Router, Router } from "express";
import upload from "../Middlewares/file.middleware";
import VerifyJWT from "../Middlewares/verifyjwt.middleware";
import { VideoUpload } from "../controllers/video.controller";

const router = Router();

router.route("/upload-video").post(
  VerifyJWT,
  upload.fields([
    {
      Video: 1,
      maxCount: 1,
    },
    {
      Thumbnail: 1,
      maxCount: 1,
    },
  ]),
  VideoUpload
);

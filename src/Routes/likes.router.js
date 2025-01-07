import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import {
  SaveLikeForComment,
  SaveLikeForVideo,
  SaveLikedOfTweet,
} from "../controllers/likes.controller.js";

const router = Router();

//routing for likes for videos

router.route("/video/:videoid").post(VerifyJWT, SaveLikeForVideo);

//routing for likes for comment'

router.route("/comment").post(VerifyJWT, SaveLikeForComment);

//routing for likes for tweet
router.route("/tweet").post(VerifyJWT, SaveLikedOfTweet);

export default router;

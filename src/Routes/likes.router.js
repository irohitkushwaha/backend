import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware";
import {
  SaveLikeForComment,
  SaveLikeForVideo,
  SaveLikedOfTweet,
} from "../controllers/likes.controller";

const router = Router();

//routing for likes for videos

router.route("/video").post(VerifyJWT, SaveLikeForVideo);

//routing for likes for comment'

router.route("/comment").post(VerifyJWT, SaveLikeForVideo);

//routing for likes for tweet
router.route("/tweet").post(VerifyJWT, SaveLikedOfTweet);

export default router;

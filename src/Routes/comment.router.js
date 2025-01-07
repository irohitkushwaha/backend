import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { SaveCommentOfTwitter, SaveCommentOfVideo, SendCommentsOfTweet, SendCommentsOfVideo } from "../controllers/comment.controller.js";

const router = Router()

router.route("/save-video/:videoid").post(VerifyJWT, SaveCommentOfVideo)

//save comment of twitter

router.route("/save-tweet/:tweetid").post(VerifyJWT, SaveCommentOfTwitter)

//send list of comments for tweet

router.route("/send-tweet").get(SendCommentsOfTweet)

//send list of comments for video

router.route("/send-video").get(SendCommentsOfVideo)



export default router
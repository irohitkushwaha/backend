import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { SaveCommentOfTwitter, SaveCommentOfVideo } from "../controllers/comment.controller.js";

const router = Router()

router.route("/save-video/:videoid").post(VerifyJWT, SaveCommentOfVideo)

//save comment of twitter

router.route("/save-tweet/:tweetid").post(VerifyJWT, SaveCommentOfTwitter)



export default router
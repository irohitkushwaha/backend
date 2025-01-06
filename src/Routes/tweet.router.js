import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { SaveTweet, GetTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/save").post(VerifyJWT, SaveTweet);

//get tweet

router.route("/get/:userid").get(GetTweet);


export default router;

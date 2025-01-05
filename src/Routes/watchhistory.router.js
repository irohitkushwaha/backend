import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { GetWatchHistory, SaveWatchHistory } from "../controllers/watchHistory.controller.js";

const router = Router()

router.route("/save-watchhistory/:VideoId").post(VerifyJWT, SaveWatchHistory)

//get watch history 
router.route("/get-watchhistory").get(VerifyJWT, GetWatchHistory )

export default router
import { Router } from "express";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { SaveWatchHistory } from "../controllers/watchHistory.controller.js";

const router = Router()

router.route("/save-watchhistory/:VideoId").post(VerifyJWT, SaveWatchHistory)

export default router
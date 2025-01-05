import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import { SubscriberData } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/:VideoId").post(VerifyJWT,SubscriberData)

export default router
import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";
import {
  SubscriberData,
  SubscriptionStatus,
  DeleteSubscriberData,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/:VideoId").post(VerifyJWT, SubscriberData);

router.route("/check/:VideoId").get(VerifyJWT, SubscriptionStatus);

router.route("/unsubscribe/:VideoId").get(VerifyJWT, DeleteSubscriberData);

export default router;

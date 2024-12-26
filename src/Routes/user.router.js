import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import RegisterUser from "../controllers/user.controller.js";

const router = Router();

 router.route("/user").post(
  upload.fields([
    { name: "Avatar", maxCount: 1 },
    {
      name: "CoverImage",
      maxCount: 1,
    },
  ]),

  RegisterUser
);

export default router;

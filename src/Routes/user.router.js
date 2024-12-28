import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import { RegisterUser, LoggedInUser, LogoutUser  } from "../controllers/user.controller.js";
import VerifyJWT from "../Middlewares/verifyjwt.middleware.js";

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

//Login ROuter

router.route("/login").post(LoggedInUser);

//Logout Router

router.route("/logout").post(VerifyJWT,LogoutUser );

export default router;

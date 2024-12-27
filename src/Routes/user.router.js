import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import RegisterUser from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


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


//next


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)

export default router;

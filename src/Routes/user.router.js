import { Router } from "express";
import upload from "../Middlewares/file.middleware.js";
import { RegisterUser, LoggedInUser, LogoutUser, RefreshingToken, ChangePassword, GetCurrentUser, UpdateUserDetail, ChangeUserAvatar, ChangeUserCoverImage, GetUserChannel, GetWatchHistory  } from "../controllers/user.controller.js";
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

//refresh token

router.route("/refresh-token").post(RefreshingToken)

//change password

router.route("/change-password").post(VerifyJWT, ChangePassword)

//getCurrentUser

router.route("/get-user").get(VerifyJWT, GetCurrentUser)

//updated user detail

router.route("/update-user-detail").patch(VerifyJWT, UpdateUserDetail)

//updated user avatar

router.route("/change-user-avatar").patch(VerifyJWT, upload.fields([
  { name: "Avatar", maxCount: 1 },
]), ChangeUserAvatar )

//update cover image
router.route("/change-cover-image").patch(VerifyJWT, upload.fields([
  { name: "CoverImage", maxCount: 1 },
]), ChangeUserCoverImage )

//get user channel

router.route("/user-channel").get(VerifyJWT, GetUserChannel)

//get watch History

router.route("/get-watchhistory").get(VerifyJWT, GetWatchHistory)


export default router;

import User from "../Models/user.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import UploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//Algorithm to create User Registration

//1. Take Data from User - frontend
//2. Check Empty field
//3. Check Existed user with same username or email
//4. Take Files from Multer from temp folder
//5. Check whether these files exist or not, (avatar is mandatory if no throw error)
//6. Upload these file on Cloudinary
//7. check if the file uploaded on cloudinary is success
//8. save the user detail and file url to database
//9. check whether saved or not
//10. get user data exlclude password and refreshtoken for sending response to frontend
//11. finally, send response using apiresponse

const RegisterUser = asyncHandler(async (req, res) => {
  console.log("1st below register in user fn, req.body is", req.body);

  const { UserName, FullName, Email, Password } = req.body;

  if ([UserName, FullName, Email, Password].some((field) => !field)) {
    throw new ApiError(401, "All field is required");
  }

  const ExistedUser = await User.findOne({
    $or: [{ Email }, { UserName }],
  });

  if (ExistedUser) {
    throw new ApiError(409, "Username or Email Already exist");
  }

  const Avatar = req.files?.Avatar?.[0]?.path;
  if (!Avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  let CoverImage;

  if (req.files?.CoverImage?.length > 0) {
    CoverImage = req.files.CoverImage[0].path || "";
  }

  const AvatarUpload = await UploadOnCloudinary(Avatar);
  const CoverImageUpload = await UploadOnCloudinary(CoverImage);

  if (!AvatarUpload) {
    throw new ApiError(500, "server error while uploading avatar");
  }

  const UserSaving = await User.create({
    UserName: UserName.toLowerCase(),
    FullName,
    Email: Email.toLowerCase(),
    Password,
    CoverImage: CoverImageUpload?.url || "",
    Avatar: AvatarUpload?.url,
  });

  const isUserSaved = await User.findById(UserSaving._id).select(
    "-Password -RefreshToken"
  );

  if (!isUserSaved) {
    throw new ApiError(500, "error while saving user data to database");
  }

  res.status(200).json(new ApiResponse(isUserSaved, 200));
});

//Alogithm for Logging the user
//1. get email/username and password from frontend
//2. make sure at least one of email or username is available and password, should not be empty
//3. Check email or username exist by db calling, if not throw error
//4. Check or Match the password from bcrypt, if not throw error

//5. Generate Access and Refresh Token - Function
/////5.1  Make a function that will give access and refresh
/////5.2 It require user id for db call to create instance for generating or calling access and refresh token
/////5.3 This function will take User id as argument

//6. Get Access token, if not throw error
//7. get refresh token, if not throw error
//8. db call findbyidandupdate and put refresh token
//9. send access and refresh token through cookies, make sure option(Secure, http)
//10. send json response to client through api response succesfully logged

//Access and Refresh token function

const AccessRefreshTokenGenerator = async (user) => {
  const AccessToken = await user.generateAccessToken();
  const RefreshToken = await user.generateRefreshToken();
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: { RefreshToken: RefreshToken },
    },
    { new: true }
  );
  return { AccessToken, RefreshToken };
};

const LoggedInUser = asyncHandler(async (req, res) => {
  console.log("req is", req);
  const { UserName, Email, Password } = req.body;

  if (!UserName && !Email) {
    throw new ApiError(401, "Username or Email is Required!");
  }

  if (!Password) {
    throw new ApiError(401, "Password is Required!");
  }

  const user = await User.findOne({
    $or: [{ UserName }, { Email }],
  });

  if (!user) {
    throw new ApiError(400, "Invalid email or username, doesn`t exist");
  }

  const password = await user.isPasswordCorrect(Password);

  if (!password) {
    throw new ApiError(400, "Password is incorrect");
  }

  const UserData = await User.findById(user._id).select(
    "-Password -RefreshToken"
  );
  console.log("userData is", UserData);

  const AccessRefreshToken = await AccessRefreshTokenGenerator(user);
  console.log("AccessRefreshToken:", AccessRefreshToken);
  const option = {
    httpOnly: true,
    // secure: true,
  };
  res
    .status(200)
    .cookie("RefreshToken", AccessRefreshToken.RefreshToken, option)
    .cookie("AccessToken", AccessRefreshToken.AccessToken, option)
    .json(new ApiResponse(UserData, 200, "Logged in Successfully"));
});

//Algorithm for Logout

//1. Check whether user is Logged or not through middleware
///1.1 Verify the access token of user with secret key access token through jwt verify
//2. Remove refresh token from database
//3. Send Response, status code, clear cookies access and refresh token, send message

const LogoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!_id) {
    throw new ApiError(400, "Invalid or missing user information in token");
  }
  const RemoveRefresh = await User.findByIdAndUpdate(
    _id,
    {
      $unset: { RefreshToken: 1 },
    },
    {
      runValidators: false,
    }
  );

  if (!RemoveRefresh) {
    throw new ApiError(500, "error while removing refresh token");
  }

  const option = {
    httpOnly: true,
    // secure : true
  };

  res
    .status(200)
    .clearCookie("RefreshToken", option)
    .clearCookie("AccessToken", option)
    .json(new ApiResponse({}, 200, "Logout successful"));
});

//Algorithm for refreshing the token means sending access token when expire by matching refresh token'

//1. get refresh token from user as it would be available even after access token expired, in the cookies
//2. check if refresh token available or not, if not throw error
//3. decodedToken = verify the incoming refresh token using refresh secret key
//4. check decoded token verified or not, if not throw error
//5. call the db to get refresh token saved in database
//6. match the incoming refresh token with refresh token saved in database, if not throw error
//7. if matched then generate access and refresh token,
//8. send the access and refresh token via cookie with json

const RefreshingToken = asyncHandler(async (req, res) => {
  const IncomingRefreshToken =
    req.cookies?.RefreshToken || req.body?.RefreshToken;
  if (!IncomingRefreshToken) {
    throw new ApiError(401, "refresh token is not available");
  }
  const DecodedToken = jwt.verify(
    IncomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!DecodedToken) {
    throw new ApiError(401, "invalid refresh token");
  }
  const user = await User.findById(DecodedToken?._id);

  if (!user) {
    throw new ApiError(500, "error while calling db using decodedtoken id");
  }

  if (IncomingRefreshToken !== user.RefreshToken) {
    throw new ApiError(401, "wrong refresh token as it doesn`t match");
  }

  const { AccessToken, RefreshToken } = await AccessRefreshTokenGenerator(user);

  const option = {
    httpOnly: true,
    // secure : true,
  };

  res
    .status(200)
    .cookie("RefreshToken", RefreshToken, option)
    .cookie("AccessToken", AccessToken, option)
    .json(new ApiResponse({}, 200, "token has been refreshed"));
});

//Algoritm to Change Current user Password

//1. check whether logged in using verifyjwt middleware
//2. get oldpassword and newpassword from frontend
//3. check both old and new password is not empty, if empty throw error
//4. compare old password with the current password using bcrypt compare, if not throw error wrong password
//5. Make a db call SET new password value to password field in database, don`t call directly using findByIDAndUpdate as pre save hook is there to hash the password, so save it using object
//6. after changing, send response to frontend

const ChangePassword = asyncHandler(async (req, res) => {
  const { OldPassword, NewPassword } = req.body;

  if (!(OldPassword && NewPassword)) {
    throw new ApiError(400, "OldPassword and NewPassword is required");
  }
  const user = await User.findById(req.user._id);

  const IsPasswordCorrect = await user.isPasswordCorrect(OldPassword);

  if (!IsPasswordCorrect) {
    throw new ApiError(400, "OldPassword is not correct");
  }

  user.Password = NewPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse({}, 200, "Password changed successfully"));
});

//Algorithm to get current user

//1. verify whether user is logged or not through middleware verifyjwt if not throw error
//2. create a function, make a db call using findbyid from req.user
//3. send the data in apiresponse to user

const GetCurrentUser = asyncHandler(async (req, res) => {
  const userDetail = await User.findById(req.user._id).select(
    "-Password -RefreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(userDetail, 200, "User Sent Successfully"));
});

//Algorithm to update account details

//1. check whether user is logged or not
//2. get data from frontend like fullname, username, email
//3. make sure at least one field is not empty, if all empty throw error
//4. make a db call findbyidandupdate and update
//5. return response to user

export {
  RegisterUser,
  LoggedInUser,
  LogoutUser,
  RefreshingToken,
  ChangePassword,
  GetCurrentUser,
};

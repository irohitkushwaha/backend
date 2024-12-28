import User from "../Models/user.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import UploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

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
  console.log("Generated AccessToken:", AccessToken);
  console.log("Generated RefreshToken:", RefreshToken);
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
  console.log("1st below logged in user fn, req.body is", req.body);
  const { UserName, Email, Password } = req.body;

  if (!UserName && !Email) {
    throw new ApiError(401, "Username or Email is Required!");
  }

  if (!Password) {
    throw new ApiError(401, "Password is Required!");
  }

  const user = await User.findOne({
    $or: [{ UserName }, { Email }],
  }).select("-Password -RefreshToken");
  console.log("user is", user);

  if (!user) {
    throw new ApiError(400, "Invalid email or username, doesn`t exist");
  }

  const password = await user.isPasswordCorrect(Password);

  if (!password) {
    throw new ApiError(400, "Password is incorrect");
  }

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
    .json(new ApiResponse(user, 200, "Logged in Successfully"));
});

export { RegisterUser, LoggedInUser };

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

export default RegisterUser;


//Login and logout section

const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})


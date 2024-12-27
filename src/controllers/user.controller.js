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


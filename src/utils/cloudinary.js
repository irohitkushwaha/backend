import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (localFile) => {
  try {
    if (localFile) {
      const upload = await cloudinary.uploader.upload(localFile, {
        resource_type: "auto",
      });
      fs.unlinkSync(localFile);
      return upload;
    } else {
      return null;
    }
  } catch (error) {
    if (fs.existsSync(localFile)) {
      fs.unlinkSync(localFile);
    }
    return null;
  }
};

export default UploadOnCloudinary;

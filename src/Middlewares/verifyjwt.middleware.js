import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const VerifyJWT = async (req, res, next) => {
  const token =
    req.cookies?.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Missing authentication tokens");
  }
  let verifiedAccessToken;
  try {
    verifiedAccessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(400, "Access token can`t verified");
  }

  req.verifiedAccessToken = verifiedAccessToken;

  next();
};

export default VerifyJWT;

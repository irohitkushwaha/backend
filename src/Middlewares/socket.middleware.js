import jwt from "jsonwebtoken";
import cookie from "cookie";
import ApiError from "../utils/ApiError";

const SocketVerifyJwt = (socket, next) => {
  try {
    const rawcookie = socket.handshake.headers.cookie;

    if (!rawcookie) {
      throw new ApiError(400, "raw cookie not found");
    }

    const UserCookie = cookie.parse(rawcookie);

    const accessToken = UserCookie.accessToken;

    if (!accessToken) {
      throw new ApiError(400, "access token is not found in socket connection");
    }

    const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!user) {
      throw new ApiError(
        400,
        "access token can`t be verified in socket connection"
      );
    }

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export { SocketVerifyJwt };

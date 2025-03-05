import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiErr.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(400, "Unauthorized request");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) throw new ApiError(400, "Invalid Access Token");

  req.user = user;
  next();
});

export default verifyJwt;

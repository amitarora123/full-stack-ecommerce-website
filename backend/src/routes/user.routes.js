import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  logoutUser,
  fetchAdmin,
  fetchUser
} from "../controllers/user.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/adminAuth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/logout", verifyJwt, logoutUser);
userRouter.get("/fetchUser", verifyJwt, fetchUser)
userRouter.get("/fetchAdmin", verifyAdmin, fetchAdmin)

export default userRouter;

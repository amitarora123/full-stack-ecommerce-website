import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import {
  addToCart,
  getUserCart,
  updateCart,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.use(verifyJwt);

cartRouter.route("/").get(getUserCart).post(addToCart).put(updateCart);

export default cartRouter;
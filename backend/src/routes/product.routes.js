import { Router } from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
} from "../controllers/product.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyAdmin from "../middleware/adminAuth.middleware.js";

const productRouter = Router();

productRouter.post(
  "/add",
  verifyAdmin,
  upload.fields([
    {
      name: "image1",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
    {
      name: "image3",
      maxCount: 1,
    },
    {
      name: "image4",
      maxCount: 1,
    },
  ]),
  addProduct
);
productRouter.post("/remove", verifyAdmin, removeProduct);
productRouter.get("/single/:productId", singleProduct);
productRouter.get("/list", listProducts);

export default productRouter;

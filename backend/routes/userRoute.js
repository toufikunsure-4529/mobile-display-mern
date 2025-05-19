import express from "express";
import {
  addToCart,
  cancelOrder,
  createOrder,
  getProfile,
  listOrder,
  loginUser,
  registerUser,
  removeFromCart,
  updateCartQuantity,
  updateProfile,
} from "../controllers/userController.js";
import {
  allBrands,
  getAllProducts,
  getModelByBrandAndSeries,
  getSeriesByBrandWise,
} from "../controllers/adminController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";


const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list-brands", allBrands);
userRouter.get("/series-list", getSeriesByBrandWise);
userRouter.get("/model-list", getModelByBrandAndSeries);
userRouter.get("/product-list", getAllProducts);
userRouter.post("/order", authUser, createOrder);
userRouter.post("/list-order", authUser, listOrder);
userRouter.post("/cancel-order", authUser, cancelOrder);
userRouter.post("/add-to-cart", authUser, addToCart);
userRouter.post("/update-cart-quantity", authUser, updateCartQuantity);
userRouter.post("/remove-cart", authUser, removeFromCart);
userRouter.post("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfile
);

export default userRouter;

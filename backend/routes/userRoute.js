import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import {
  allBrands,
  getAllProducts,
  getModelByBrandAndSeries,
  getSeriesByBrandWise,
} from "../controllers/adminController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list-brands", allBrands);
userRouter.get("/series-list", getSeriesByBrandWise);
userRouter.get("/model-list", getModelByBrandAndSeries);
userRouter.get("/product-list", getAllProducts);

export default userRouter;

import express from "express";
import {
  createBrand,
  createCategory,
  createModel,
  createProduct,
  createSeries,
  loginAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post(
  "/create-category",
  authAdmin,
  upload.single("image"),
  createCategory
);
adminRouter.post(
  "/create-brand",
  authAdmin,
  upload.single("image"),
  createBrand
);
adminRouter.post("/create-series", authAdmin, createSeries);
adminRouter.post(
  "/create-model",
  authAdmin,
  upload.single("image"),
  createModel
);
adminRouter.post(
  "/create-product",
  upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "images", maxCount: 10 }, // Adjust maxCount as needed
  ]),
  createProduct
);
adminRouter.post("/login", loginAdmin);
export default adminRouter;

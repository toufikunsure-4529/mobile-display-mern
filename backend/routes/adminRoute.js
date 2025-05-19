import express from "express";
import {
  createBrand,
  createCategory,
  createModel,
  createProduct,
  createSeries,
  deleteBrand,
  deleteCategory,
  deleteModel,
  deleteProduct,
  deleteSeries,
  getAllOrdersList,
  loginAdmin,
  updateBrand,
  updateCategory,
  updateModel,
  updateOrderStatus,
  updateProducts,
  updateSeries,
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
adminRouter.post(
  "/update-category",
  authAdmin,
  upload.single("image"),
  updateCategory
);
adminRouter.post(
  "/update-brand",
  authAdmin,
  upload.single("image"),
  updateBrand
);
adminRouter.post("/update-series", authAdmin, updateSeries);
adminRouter.post(
  "/update-model",
  authAdmin,
  upload.single("image"),
  updateModel
);
adminRouter.post(
  "/update-products",
  authAdmin,
  upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "images", maxCount: 10 }, // Adjust maxCount as needed
  ]),
  updateProducts
);

adminRouter.post("/delete-category", authAdmin, deleteCategory);
adminRouter.post("/delete-brand", authAdmin, deleteBrand);
adminRouter.post("/delete-series", authAdmin, deleteSeries);
adminRouter.post("/delete-model", authAdmin, deleteModel);
adminRouter.post("/delete-product", authAdmin, deleteProduct);
adminRouter.post("/get-all-order", authAdmin, getAllOrdersList);
adminRouter.post("/update-orderstatus", authAdmin, updateOrderStatus);

export default adminRouter;

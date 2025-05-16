import { v2 as cloudinary } from "cloudinary";
import CategoryModel from "../models/Category.js";
import fs from "fs/promises";
import brandModel from "../models/brand.js";
import seriesModel from "../models/series.js";
import mongoose from "mongoose";
import modelModels from "../models/Model.js";
import productModel from "../models/Product.js";
import jwt from "jsonwebtoken";

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;

    // Validate inputs
    if (!name || !imageFile) {
      return res.status(400).json({ message: "Name and image are required" });
    }

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "categories",
    });

    // Create new category
    const categoryData = {
      name,
      image: imageUpload.secure_url,
      date: new Date(),
    };

    const newCategory = new CategoryModel(categoryData);
    const category = await newCategory.save();

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    if (!name || !imageFile) {
      return res.status(400).json({ message: "Name and image are required" });
    }

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "brands",
    });

    const brandData = {
      name: name,
      image: imageUpload.secure_url,
    };
    const newBrands = new brandModel(brandData);
    const brand = await newBrands.save();
    return res.status(201).json({
      message: "Brand created successfully",
      brand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return res.status(500).json({
      message: "Error creating brand",
      error: error.message,
    });
  }
};
const createSeries = async (req, res) => {
  try {
    const { name, brandId } = req.body;

    if (!name || !brandId) {
      return res.status(400).json({
        success: false,
        message: "Name and brandId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brandId format",
      });
    }

    const brandExists = await brandModel.findById(brandId);
    if (!brandExists) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const existingSeries = await seriesModel.findOne({ name, brandId });
    if (existingSeries) {
      return res.status(409).json({
        success: false,
        message: "Series with this name already exists for the selected brand",
      });
    }

    const newSeries = new seriesModel({ name, brandId });
    const savedSeries = await newSeries.save();

    return res.status(201).json({
      success: true,
      message: "Series created successfully",
      data: savedSeries,
    });
  } catch (error) {
    console.error("Error creating series:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating series",
      error: error.message,
    });
  }
};

const createModel = async (req, res) => {
  try {
    const { name, brandId, seriesId } = req.body;
    const imageFile = req.file;
    if (!name || !brandId || !seriesId || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required Data mising",
      });
    }
    const brandExists = await brandModel.findById(brandId);
    if (!brandExists) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }
    const existingSeries = await seriesModel.findById(seriesId);
    if (!existingSeries) {
      return res.status(404).json({
        success: false,
        message: "Series not found",
      });
    }

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "models",
    });
    const newModel = new modelModels({
      name,
      brandId,
      seriesId,
      image: imageUpload.secure_url,
    });
    const models = await newModel.save();
    return res.status(201).json({
      success: true,
      message: "Model created successfully",
      models,
    });
  } catch (error) {
    console.error("Error creating model:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating model",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      categoryId,
      brandId,
      seriesId,
      modelId,
      variableProduct,
      hasQualityOptions,
      stock,
      price,
      salePrice,
      bestSelling,
      newArrival,
      description,
      keyFeatures,
      inTheBox,
      compatibility,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !shortDescription ||
      !categoryId ||
      !brandId ||
      !seriesId ||
      !modelId ||
      !stock ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if images are uploaded
    if (!req.files || !req.files.featureImage || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: "Feature image and product images are required",
      });
    }

    // Validate category exists
    const categoryExists = await CategoryModel.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate brand exists
    const brandExists = await brandModel.findById(brandId);
    if (!brandExists) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Validate series exists
    const seriesExists = await seriesModel.findById(seriesId);
    if (!seriesExists) {
      return res.status(404).json({
        success: false,
        message: "Series not found",
      });
    }

    // Validate model exists
    const modelExists = await modelModels.findById(modelId);
    if (!modelExists) {
      return res.status(404).json({
        success: false,
        message: "Model not found",
      });
    }

    // Upload feature image to Cloudinary
    const featureImageUpload = await cloudinary.uploader.upload(
      req.files.featureImage[0].path,
      {
        resource_type: "image",
        folder: "products/feature",
      }
    );

    // Upload multiple images to Cloudinary
    const imageUploadPromises = req.files.images.map((file) =>
      cloudinary.uploader.upload(file.path, {
        resource_type: "image",
        folder: "products/gallery",
      })
    );
    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map((img) => img.secure_url);

    // Save product to DB
    const newProduct = new productModel({
      name,
      shortDescription,
      categoryId,
      brandId,
      seriesId,
      modelId,
      variableProduct,
      hasQualityOptions,
      stock,
      price,
      salePrice,
      bestSelling,
      newArrival,
      featureImage: featureImageUpload.secure_url,
      images: imageUrls,
      description,
      keyFeatures,
      inTheBox,
      compatibility,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token: token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in admin",
    });
  }
};

export {
  createCategory,
  createBrand,
  createSeries,
  createModel,
  createProduct,
  loginAdmin
};

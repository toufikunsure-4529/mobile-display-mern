import { v2 as cloudinary } from "cloudinary";
import CategoryModel from "../models/Category.js";
import fs from "fs/promises";
import brandModel from "../models/brand.js";
import seriesModel from "../models/series.js";
import mongoose, { model } from "mongoose";
import modelModels from "../models/Model.js";
import productModel from "../models/Product.js";
import jwt from "jsonwebtoken";
import orderModel from "../models/orderModel.js";

//API for create New Category
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

//API for  create Brands
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
//API for create New Series
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

// API for create New Model
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

// API end point for create new products
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

//API end point fo login ADMin
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

//API to get all Brands List for admin panel
const allBrands = async (req, res) => {
  try {
    const brands = await brandModel.find({});
    return res.status(200).json({
      success: true,
      message: "Brands list fetched successfully",
      brands: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching brands",
    });
  }
};

// API for get all series brand wise
const getSeriesByBrandWise = async (req, res) => {
  try {
    const { brandId } = req.body;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "brandId is required",
      });
    }

    const series = await seriesModel.find({ brandId });

    if (!series || series.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No series found for the provided brandId",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Series list fetched successfully",
      series,
    });
  } catch (error) {
    console.error("Error fetching series by brandId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching series",
    });
  }
};

// API for get all model by seriesId
const getModelByBrandAndSeries = async (req, res) => {
  try {
    const { brandId, seriesId } = req.body;
    if (!brandId || !seriesId) {
      return res.status(400).json({
        success: false,
        message: "brandId and seriesId are required",
      });
    }
    const model = await modelModels.find({ brandId, seriesId });
    if (!model) {
      return res.status(404).json({
        success: false,
        message: "No model found for the provided brandId and seriesId",
      });
    }
    return res.status(200).json({
      success: true,
      model,
      message: "Model fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching model by series:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching model",
    });
  }
};

// API for Get ALL Products
const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }
    return res.status(200).json({
      success: true,
      products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching products",
    });
  }
};

// API for Update Category
const updateCategory = async (req, res) => {
  try {
    const { categoryId, name } = req.body;
    const imageFile = req.file;
    if (!categoryId || !name || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Invalid request, missing required fields",
      });
    }
    //Validate category Id
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const updateData = {
      name: name,
    };
    //Update category
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      updateData,
      {
        new: true,
      }
    );
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    //Update category image
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "categories",
        });
        const imageUrl = imageUpload.secure_url;
        await CategoryModel.findByIdAndUpdate(
          categoryId,
          { image: imageUrl },
          { new: true }
        );
      } catch (error) {
        console.error("Error updating category image:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error while updating category image",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating category",
    });
  }
};

// API for Update Brand
const updateBrand = async (req, res) => {
  try {
    const { brandId, name } = req.body;
    const imageFile = req.file;
    if ((!brandId, !name, !imageFile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //Validate brand Id
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid brand ID" });
    }
    // update brand
    const updatedData = {
      name: name,
    };
    const brand = await brandModel.findByIdAndUpdate(brandId, updatedData, {
      new: true,
    });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "brands", // Specify the folder where the image will be uploaded
        });
        const imageURL = imageUpload.secure_url;
        await brandModel.findByIdAndUpdate(
          brandId,
          { image: imageURL },
          { new: true }
        );
      } catch (error) {
        console.error("Error updating brand image:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error while updating brand image",
        });
      }
    }
    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating brand",
    });
  }
};

// update series API
const updateSeries = async (req, res) => {
  try {
    const { seriesId, name } = req.body; // Get the series ID from the request body
    if ((!seriesId, !name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      }); // Return a 400 error if the request is invalid
    }
    // Validate seriesId
    if (!mongoose.Types.ObjectId.isValid(seriesId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Series ID" });
    }
    // Update the series document
    const updatedData = {
      name: name, // Update the name field with the new value
    };
    const seriesUpdate = await seriesModel.findByIdAndUpdate(
      seriesId,
      updatedData,
      { new: true }
    );
    if (!seriesUpdate) {
      return res.status(404).json({
        success: false,
        message: "Series not found",
      });
    }
    // Return a success response with the updated series data
    return res.status(200).json({
      success: true,
      message: "Series updated successfully",
      data: seriesUpdate,
    });
  } catch (error) {
    console.error("Error updating series:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating series",
    });
  }
};

// update models API
const updateModel = async (req, res) => {
  try {
    const { modelId, name } = req.body;
    const imageFile = req.file;
    if ((!modelId, !name, !imageFile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request Please provide all required fields",
      });
    }
    // Validate modelId
    if (!mongoose.Types.ObjectId.isValid(modelId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Model ID" });
    }
    // Update the model document
    const updatedData = {
      name: name, // Update the name field with the new value
    };
    const updateModel = await modelModels.findByIdAndUpdate(
      modelId,
      updatedData,
      { new: true }
    );
    if (!updateModel) {
      return res.status(404).json({
        success: false,
        message: "Model not found",
      });
    }
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "models",
        });
        const imageURL = imageUpload.secure_url;
        await modelModels.findByIdAndUpdate(
          modelId,
          { image: imageURL },
          { new: true }
        );
      } catch (error) {
        console.error("Error updating model image:", error);
      }
    }
    return res.status(200).json({
      success: true,
      message: "Model updated successfully",
    });
  } catch (error) {
    console.error("Error updating models:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating models",
    });
  }
};

// update products API
const updateProducts = async (req, res) => {
  try {
    const {
      productId,
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

    const featureImageFile = req.files?.featureImage?.[0];
    const imageFiles = req.files?.images;

    // Validate required fields
    if (
      !productId ||
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
        message: "Please fill in all required fields",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    // Prepare updated data
    const updatedData = {
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
    };

    // Upload feature image if provided
    if (featureImageFile) {
      try {
        const uploadFeatureImage = await cloudinary.uploader.upload(
          featureImageFile.path,
          {
            resource_type: "image",
            folder: "products/feature",
          }
        );
        updatedData.featureImage = uploadFeatureImage.secure_url;
      } catch (error) {
        console.error("Feature image upload failed:", error);
      }
    }

    // Upload gallery images if provided
    if (imageFiles && imageFiles.length > 0) {
      try {
        const imageUploadPromises = imageFiles.map((file) =>
          cloudinary.uploader.upload(file.path, {
            resource_type: "image",
            folder: "products/gallery",
          })
        );
        const uploadedImages = await Promise.all(imageUploadPromises);
        const imageUrls = uploadedImages.map((img) => img.secure_url);

        updatedData.images = imageUrls; // Overwrite or merge depending on your logic
      } catch (error) {
        console.error("Gallery image upload failed:", error);
      }
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating product",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID is required" });
    }
    let category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    category = await CategoryModel.findByIdAndDelete(categoryId);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting category",
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.body;
    if (!brandId) {
      return res
        .status(400)
        .json({ success: false, message: "Brand ID is required " });
    }
    let brand = await brandModel.findById(brandId);
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }
    brand = await brandModel.findByIdAndDelete(brandId);
    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting brand",
    });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const { seriesId } = req.body;
    if (!seriesId) {
      return res
        .status(400)
        .json({ success: false, message: "Series ID is required " });
    }
    let series = await seriesModel.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Series not found",
      });
    }
    series = await seriesModel.findByIdAndDelete(seriesId);
    return res.status(200).json({
      success: true,
      message: "Series deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting series:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting series",
    });
  }
};

// delete Models API
const deleteModel = async (req, res) => {
  try {
    const { modelId } = req.body;
    if (!modelId) {
      return res.status(400).json({
        success: false,
        message: "Model ID is required",
      });
    }

    let model = await modelModels.findById(modelId);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: "Model not found",
      });
    }
    model = await modelModels.findByIdAndDelete(modelId);
    return res.status(200).json({
      success: true,
      message: "Model deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting model:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting model",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }
    let product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    product = await productModel.findByIdAndDelete(productId);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting product",
    });
  }
};

// API for get all orders List for Admin Panel
const getAllOrdersList = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return res.status(200).json({
      success: true,
      message: "Orders list fetched successfully",
      orders: orders,
    });
  } catch (error) {
    console.error("Error getting all orders list:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting all orders list",
    });
  }
};

// API for update order status from admin panel
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus, trackingNumber } = req.body;
    if (!orderId || !orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    // validate order status
    const validStatus = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatus.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatus.join(
          ", "
        )}`,
      });
    }

    // Find by order id
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prepare update object
    const updateData = { orderStatus };
    // Handle specific status updates
    if (orderStatus === "shipped") {
      updateData.trackingNumber = trackingNumber;
    }

    if (orderStatus === "delivered") {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    if (orderStatus === "cancelled") {
      updateData.isPaid = false;
      updateData.isDelivered = false;
    }

    // Update order
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating order status",
    });
  }
};

export {
  createCategory,
  createBrand,
  createSeries,
  createModel,
  createProduct,
  loginAdmin,
  allBrands,
  getSeriesByBrandWise,
  getModelByBrandAndSeries,
  getAllProducts,
  updateCategory,
  updateBrand,
  updateSeries,
  updateModel,
  updateProducts,
  deleteCategory,
  deleteBrand,
  deleteSeries,
  deleteModel,
  deleteProduct,
  getAllOrdersList,
  updateOrderStatus,
};

import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import productModel from "../models/Product.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";
import cartModel from "../models/cartModel.js";
import { v2 as cloudinary } from "cloudinary";

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    // Validation email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Validation Password Strong
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    //Hasing password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const userData = {
      name: name,
      email: email,
      phone: phone,
      password: hashPassword,
    };
    const newUser = new userModel(userData); // Create a new user document
    const user = await newUser.save(); // Save the user document to the database
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // Generate a JWT token
    res
      .status(201)
      .json({ success: true, message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

// User Login API
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }); // Find the user document in the database
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not Registered Please Register" });
    }
    const isMatch = await bcrypt.compare(password, user.password); // Compare the password with the hashed password
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // Generat JWT token
      res
        .status(200)
        .json({ success: true, message: "User logged in successfully", token });
    } else {
      return res.status(401).json({ message: "Invalid Password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

// API to user Profile Data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    res.status(200).json({
      success: true,
      message: "User Profile Data Fetched Successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, gender } = req.body;
    const imageFile = req.file;
    if ((!userId, !name, !phone, !address, !gender)) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Parse address
    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address format" });
    }

    const updateData = {
      name,
      phone,
      address: parsedAddress,
      gender,
    };
    const user = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Handle image upload
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "user",
        });
        const imageURL = imageUpload.secure_url;
        await userModel.findByIdAndUpdate(
          userId,
          { image: imageURL },
          { new: true }
        );
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload image" });
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

// Create New Order API
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      productId,
      shippingAddress,
      totalPrice,
      orderNotes,
      tax = 0,
      shippingCost = 0,
      discount = 0,
    } = req.body;
    // Validate required fields
    if (!userId || !productId || !shippingAddress || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const productData = await productModel.findById(productId); // Find product by ID
    if (!productData) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate shipping address fields
    const requiredAddressFields = [
      "fullName",
      "address",
      "city",
      "state",
      "postalCode",
      "phone",
      "email",
    ];
    const missingAddressFields = requiredAddressFields.filter(
      (field) => !shippingAddress[field]
    );

    if (missingAddressFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required shipping address fields: ${missingAddressFields.join(
          ", "
        )}`,
      });
    }

    // Validate email format using validator
    if (!validator.isEmail(shippingAddress.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate totalPrice
    if (typeof totalPrice !== "number" || totalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Total price must be a non-negative number",
      });
    }

    const newOrder = new orderModel({
      userId,
      productId,
      userData: userData,
      productData: productData,
      shippingAddress,
      totalPrice,
      tax,
      shippingCost,
      discount,
      orderNotes,
      orderStatus: "pending",
      isPaid: false,
      isDelivered: false,
    });

    const saveOrder = await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Order successfully",
      data: saveOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

// Get User Wise Order
const listOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const orders = await orderModel.find({ userId }); // Find orders by user ID
    res.status(200).json({
      success: true,
      message: "Order Fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    const orderData = await orderModel.findById(orderId);
    if (orderData.userId !== userId) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }
    await orderModel.findByIdAndUpdate(orderId, { orderStatus: "cancelled" }); // Update order status to cancelled
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

// API to add or update items in the cart
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const productData = await productModel.findById(productId);
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId format",
      });
    }

    // Validate productData has price or salePrice
    if (!productData.salePrice && !productData.price) {
      return res.status(400).json({
        success: false,
        message: "productData must contain either salePrice or price",
      });
    }

    // Find Or create cart
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      // Create new cart
      const itemPrice = productData.salePrice || productData.price; // Use salePrice if available, else price

      cart = new cartModel({
        userId,
        items: [{ productId, quantity, productData }],
        totalItems: quantity,
        totalPrice: itemPrice * quantity,
      });
    } else {
      // Update existing cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      ); // Find the item in the cart

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].productData = productData; // Update productData in case it changed
      } else {
        cart.items.push({ productId, quantity, productData });
      }
      // recalculate total price
      cart.totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      cart.totalPrice = cart.items.reduce((sum, item) => {
        const itemPrice = item.productData.salePrice || item.productData.price; // Use salePrice if available, else price
        return sum + itemPrice * item.quantity;
      }, 0);
    }
    const savedCart = await cart.save();
    return res.status(200).json({
      success: true,
      message: cart.isNew
        ? "Cart created successfully"
        : "Cart updated successfully",

      data: savedCart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

// API for update cart quantity
const updateCartQuantity = async (req, res) => {
  try {
    const { userId, productId, operation } = req.body;
    if (!userId || !productId || !operation) {
      return res.status(400).json({
        success: false,
        message: "userId, productId, and operation are required",
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId format",
      });
    }
    if (!["increment", "decrement"].includes(operation)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid operation. It should be either 'increment' or 'decrement'",
      });
    }

    //Find the cart
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
    // Update quantity
    if (operation === "increment") {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items[itemIndex].quantity -= 1;
    }

    // Remove item if quantity is 0 or less
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
    // If cart is empty, delete it
    if (cart.items.length === 0) {
      await cartModel.deleteOne({ userId });
      return res.status(200).json({
        success: true,
        message: "Cart cleared as the last item was removed",
        data: null,
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => {
      const itemPrice = item.productData.salePrice || item.productData.price;
      return sum + itemPrice * item.quantity;
    }, 0);
    const updatedCart = await cart.save();
    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validate input parameters
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Both userId and productId are required",
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId format",
      });
    }

    // Find the cart
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Check if product exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => {
      const itemPrice = item.productData.salePrice || item.productData.price;
      return sum + itemPrice * item.quantity;
    }, 0);

    // Handle empty cart
    if (cart.items.length === 0) {
      await cartModel.deleteOne({ userId });
      return res.status(200).json({
        success: true,
        message: "Cart cleared as the last item was removed",
        data: null,
      });
    }

    // Save updated cart
    const updatedCart = await cart.save();
    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

export {
  registerUser,
  loginUser,
  createOrder,
  listOrder,
  cancelOrder,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getProfile,
  updateProfile,
};

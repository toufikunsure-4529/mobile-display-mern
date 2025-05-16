import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

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

export { registerUser, loginUser };

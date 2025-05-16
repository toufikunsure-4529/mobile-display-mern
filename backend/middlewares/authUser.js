import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: token_decode.id };
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

export default authUser;

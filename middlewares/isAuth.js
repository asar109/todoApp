const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "login First",
    });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);
  next();
};

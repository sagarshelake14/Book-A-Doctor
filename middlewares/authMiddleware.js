const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).send({
        message: "Authorization header is missing",
        success: false,
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Invalid authorization format",
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        message: "Token is missing",
        success: false,
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error.message);

    return res.status(401).send({
      message: "Authentication failed",
      success: false,
      error: {
        message: error.message,
      },
    });
  }
};
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_PW);
    req.userData = decoded;
    res.json({
      message: "Authentication success"
    });
    next();
  } catch (error) {
    return res.json({
      message: "Authentication failed"
    });
  }
};

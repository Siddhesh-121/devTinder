const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(401).send("Invalid Token!");
    }
    // console.log(token);
    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedMessage._id);
    if (!user) {
      res.status(401).send("User not present!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};

module.exports = userAuth;

const express = require("express");
const userAuth = require("../middlewares/auth");

const requestRouter = express.Router();

requestRouter.get("/connections", userAuth, (req, res) => {
  const user = req.user;
  res.send(user.firstName + " has sent a request!");
});

module.exports = requestRouter;

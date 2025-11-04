const express = require("express");
const userAuth = require("../middlewares/auth");
const {
  validateEditProfileData,
  validatePassword,
} = require("../utils/validation");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send("Please Login!");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);
    const loggedInUser = req.user;
    const editdata = req.body;
    Object.keys(editdata).forEach((k) => {
      loggedInUser[k] = editdata[k];
    });
    console.log(loggedInUser);
    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName} your profile has been updated successfully!`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    validatePassword(req);
    const { password } = req.body;
    const user = req.user;
    const passwordhash = await bcrypt.hash(password, 10);
    user.password = passwordhash;
    user.save();
    res.send("test");
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

module.exports = profileRouter;

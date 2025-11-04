const express = require("express");
const { validateSignup } = require("../utils/validation");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignup(req);
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const userObj = {
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    };
    const user = new User(userObj);
    console.log(userObj);
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    // console.log(token);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "user added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials!");
    }
    const isPasswordMatch = await user.validatePassword(password);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    }
    const token = await user.getJWT();
    // console.log(token);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.send({ message: "Logged In!", data: user });
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("Logged Out!");
});

module.exports = authRouter;

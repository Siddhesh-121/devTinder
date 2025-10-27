const express = require("express");
const User = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user", async (req, res) => {
  const email = req.body.emailId;
  try {
    const user = await User.findOne({ emailId: email });
    if (!user) {
      res.status(404).send("User not found!");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Something went wrong! " + err.message);
  }
});

userRouter.get("/feed", async (req, res) => {
  try {
    const profiles = await User.find({});
    if (!profiles) {
      res.status(404).send("No profiles to show.");
    } else {
      res.send(profiles);
    }
  } catch (err) {
    res.status(400).send("Something went wrong! " + err.message);
  }
});

userRouter.get("/byID", async (req, res) => {
  try {
    const profiles = await User.findById("68fd09b93020a8614379dcef");
    if (!profiles) {
      res.status(404).send("No profiles to show.");
    } else {
      res.send(profiles);
    }
  } catch (err) {
    res.status(400).send("Something went wrong! " + err.message);
  }
});

userRouter.delete("/byID/:userID", async (req, res) => {
  try {
    const id = req.params.userID;
    console.log(id);
    const user = await User.findOneAndDelete({ _id: id });
    console.log(user);
    if (!user) {
      res.status(404).send("No user to delete.");
    } else {
      res.send("User deleted successfully");
    }
  } catch (err) {
    res.status(400).send("Something went wrong! " + err.message);
  }
});

userRouter.patch("/user", async (req, res) => {
  const id = req.body.userID;
  const data = req.body;
  try {
    const allowedKeys = ["gender", "photoUrl", "age", "firstName", "LastName"];
    const isAllowed = Object.keys(userObj).every((k) =>
      allowedKeys.includes(k)
    );
    if (!isAllowed) {
      throw new Error("Invalid Update!");
    }
    const user = await User.findOneAndUpdate(id, data, {
      returnDocument: "before",
      runValidators: true,
    });
    if (!user) {
      res.status(404).send("User not present");
    } else {
      let obj = { ...user.toObject() };
      obj.description = "Old User data";
      // console.log(obj);
      res.send(obj);
    }
  } catch (err) {
    res.status(400).send("Something went wrong! " + err.message);
  }
});

module.exports = userRouter;

const express = require("express");
const User = require("../models/user");
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();
const SAFE_DATA = "firstName lastName gender skills  photoUrl about age";

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    // console.log("IN");
    const loggedInUser = req.user;
    const request = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", SAFE_DATA);

    if (!request) {
      res.status(404).send("No request found!");
    }

    // console.log(request);
    res.json({ data: request });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", SAFE_DATA)
      .populate("toUserId", SAFE_DATA);

    // console.log(connections);
    if (!connections) {
      res.status(404).send("No connections found");
    }

    const data = connections.map((item) => {
      if (item.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return item.toUserId;
      } else {
        return item.fromUserId;
      }
    });

    res.send(data);
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

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

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // console.log("IN");
    const loggedInUser = req.user;
    const page = req.query.page || 1;
    let limit = req.query.limit || 10;
    limit = limit > 30 ? 30 : limit;
    const skip = (page - 1) * limit;
    const interactedUser = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    const hideUsersfrommFeed = new Set();
    interactedUser.map((item) => {
      hideUsersfrommFeed.add(item.fromUserId);
      hideUsersfrommFeed.add(item.toUserId);
    });
    // console.log(interactedUser);
    const feed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersfrommFeed) } },
        { _id: { $ne: { _id: loggedInUser._id } } },
      ],
    })
      .select(SAFE_DATA)
      .skip(skip)
      .limit(limit);
    res.send(feed);
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

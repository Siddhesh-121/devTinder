const express = require("express");
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post("/request/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const toUser = User.findById(toUserId);
    if (!toUser) {
      throw new Error("User does not exist!");
    }
    const fromUser = req.user;
    const fromUserId = req.user._id;
    const allowedStatus = ["ignored", "interested"];
    const isAllowed = allowedStatus.includes(status);
    if (!isAllowed) {
      throw new Error("Invalid Request Status!");
    }
    console.log(fromUserId);
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingRequest) {
      throw new Error("Request already present!");
    }
    const request = new ConnectionRequest({
      fromUserId: fromUserId,
      toUserId: toUserId,
      status: status,
    });

    const data = await request.save();

    let message = "";
    if (status === "interested") {
      message = `${fromUser.firstName} is interested in you!`;
    } else {
      message = `${fromUser.firstName} ignored you.`;
    }
    res.send({ message: message, data: data });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      //   console.log(status);
      const loggedInUser = req.user;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid Status request!");
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      //   console.log(status);

      if (!connectionRequest) {
        return res.status(404).send("Request not found!");
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      //   console.log(data);
      res.json({ message: "Connection request " + status, data: data });
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  }
);

module.exports = requestRouter;

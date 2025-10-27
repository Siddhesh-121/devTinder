const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const validateSignup = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userAuth = require("./middlewares/auth");

// middleware that converts req JSON to JS Object
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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
    await user.save();
    res.send("user added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the user " + err.message);
  }
});

app.post("/login", async (req, res) => {
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
    res.send("Logged In!");
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not present!");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

app.get("/user", async (req, res) => {
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

app.get("/feed", async (req, res) => {
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

app.get("/byID", async (req, res) => {
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

app.delete("/byID/:userID", async (req, res) => {
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

app.patch("/user", async (req, res) => {
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

connectDB()
  .then(() => {
    console.log("Database connection established!");
    app.listen(3000, () => {
      console.log("Server is listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database connection failed!");
  });

// .use matches to all HTTP method calls
app.use("/test", (req, res, next) => {
  console.log("test");
  res.send("Testing server!!!!");
  // next();
});

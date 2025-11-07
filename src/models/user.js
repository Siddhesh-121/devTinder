const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not Valid!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not Strong!");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => {
          if (!["male", "female", "others"].includes(value)) {
            throw new Error("Gender data is not valid");
          }
        },
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("URL is not Valid!");
        }
      },
    },
    about: {
      type: String,
      default: "This is a default description!",
      maxLength: 200,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      default: "free",
    },
    skills: {
      type: Array,
      maxLength: 10,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = async function () {
  const user = this;
  console.log(user);
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordMatch = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordMatch;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

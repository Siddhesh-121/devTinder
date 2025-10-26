const mongoose = require("mongoose");
const validator = require("validator");

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
      default: "https://akshaysaini.in/img/akshay.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("URL is not Valid!");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

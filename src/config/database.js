const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://Siddhesh:1eXWG31ExCVmwO0G@devtinder.nn3957f.mongodb.net/devTinder"
  );
};

module.exports = connectDB;

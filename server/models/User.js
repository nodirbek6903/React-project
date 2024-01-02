const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quote:{type: String},
  },
  {
    collection: "user-data",
  }
);

const User = mongoose.model("UserData", userInfoSchema);

module.exports = User;

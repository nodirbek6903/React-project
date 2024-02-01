const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quote:{type: String},
  },
  {
    collection: "users",
  }
);

const User = mongoose.model("Users", userSchema);

module.exports = User;

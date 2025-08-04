const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  password: String,
  skills_have: [String],
  skills_want: [String]
});


module.exports = mongoose.model("User", userSchema);

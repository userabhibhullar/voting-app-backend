const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 20 },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 320,
  },
  password: { type: String, required: true, minlength: 8 },
  joined_at: { type: Date, default: new Date() },
});

const User = mongoose.model("user", userSchema);

exports.User = User;

const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  date: { type: Date, default: new Date() },
  uid: { type: String },
  title: { type: String, minlength: 3, maxlength: 64, required: true },
  body: { type: String, maxlength: 1024 },
  options: {
    type: [{ type: String, required: true }],
    validator: [
      (val) => val.length > 1 || val.length <= 5,
      "Only 2 to 5 options are allowed",
    ],
  },
  usersSelection: {
    type: [
      {
        uid: { type: String, required: true },
        selection: { type: String, required: true },
        _id: false,
      },
    ],
    validator: function (arr) {
      return arr.every((sel) => sel.uid !== null && sel.uid !== undefined);
    },
  },
  author: { type: String },
});

const Poll = mongoose.model("poll", pollSchema);

exports.Poll = Poll;

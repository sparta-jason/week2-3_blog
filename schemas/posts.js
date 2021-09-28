const mongoose = require("mongoose");

const { Schema } = mongoose;
const postsSchema = new Schema({
  postsId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  writer: {
    type: String
  },
  content: {
    type: String
  },
  date: {
    type: String
  },
  password: {
    type: String
  }
});

module.exports = mongoose.model("Posts", postsSchema);
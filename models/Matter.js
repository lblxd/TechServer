const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    question: { type: String },
    answer: { type: String },
    state: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Matter',schema)
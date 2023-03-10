const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String },
    icon: { type: String },
    author: { type: String },
    price: { type: Number },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: "Category" },
    scores: { type: Number },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", schema);

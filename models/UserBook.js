const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    book: { type: mongoose.SchemaTypes.ObjectId, ref: "Book" },
    quantity: { type: Number },
    total:{type:Number}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserBook", schema);

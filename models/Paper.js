const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    title: { type: String },
    body: { type: String },
    reply: [
      {
        visitorName: { type: String },
        visitorAvatar: { type: String },
        visitorIsVip: { type: Boolean },
        description: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Paper", schema);

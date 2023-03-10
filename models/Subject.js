const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: { type: String },
  category: { type: mongoose.SchemaTypes.ObjectId, ref: "Category" },
  icon: { type: String },
  url: { type: String },
});

module.exports = mongoose.model('Subject',schema,'subjects')
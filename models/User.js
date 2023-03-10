const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    avatar: { type: String },
    username: { type: String },
    password: {
      type: String,
      select: false, //select:false指默认展示不带密码数据
      set(val) {
        return require("bcryptjs").hashSync(val, 10);
      },
    },
    purchased:[{type:mongoose.SchemaTypes.ObjectId,ref:'UserBook'}],
    address:{type:String},
    isvip: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", schema);

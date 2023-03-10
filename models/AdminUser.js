const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: { type: String },
  password: {
    type: String,
    select: false,//select:false指默认展示不带密码数据
    set(val) {
      return require("bcryptjs").hashSync(val, 10);
    },
  },
});

module.exports = mongoose.model('AdminUser',schema)
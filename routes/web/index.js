const { isValidObjectId, isObjectIdOrHexString } = require("mongoose");

module.exports = (app) => {
  const router = require("express").Router();
  const jwt = require("jsonwebtoken");
  const assert = require("http-assert");
  const Article = require("../../models/Article");
  const Category = require("../../models/Category");
  const Subject = require("../../models/Subject");
  const Book = require("../../models/Book");
  const Paper = require("../../models/Paper");
  const Matter = require("../../models/Matter");
  const User = require("../../models/User");
  const UserBook = require("../../models/UserBook");
  //登录校验中间件
  const authMiddleware = require("../../middleware/userAuth.js");
  const authVipMiddleware = require("../../middleware/vipAuth.js");
  //上传图片
  const multer = require("multer");
  const upload = multer({ dest: __dirname + "/../../uploads" });
  app.post("/web/api/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`;
    res.send(file);
  });

  //新闻列表接口
  router.get("/news/list", authMiddleware(), async (req, res) => {
    const parent = await Category.findOne({
      name: "新闻分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "category",
          as: "newsList",
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门",
      newsList: await Article.find()
        .where({
          category: { $in: subCats },
        })
        .populate("category")
        .limit(5)
        .lean(),
    });
    cats.map((cat) => {
      cat.newsList.map((news) => {
        news.categoryName = cat.name;
        return news;
      });
      return cat;
    });
    res.send(cats);
  });
  //完整新闻列表接口
  router.get("/news/list/more", authMiddleware(), async (req, res) => {
    const parent = await Category.findOne({
      name: "新闻分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "category",
          as: "newsList",
        },
      },
      {
        $addFields: {
          newsList: { $slice: ["$newsList", 5] },
        },
      }, //这个是限制显示几条的，默认设定5条
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门",
      newsList: await Article.find()
        .where({
          category: { $in: subCats },
        })
        .populate("category")
        .limit(5)
        .lean(),
    });
    cats.map((cat) => {
      cat.newsList.map((news) => {
        news.categoryName = cat.name;
        return news;
      });
      return cat;
    });
    res.send(cats);
  });
  //文章详情接口
  router.get("/articles/:id", async (req, res) => {
    const data = await Article.findById(req.params.id).lean();
    data.related = await Article.find()
      .where({
        category: { $in: data.category },
      })
      .limit(2);
    res.send(data);
  });
  /* end of article */
  //商城列表接口
  router.get("/books/list", async (req, res) => {
    const parent = await Category.findOne({
      name: "商品分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "category",
          as: "bookList",
        },
      },
      {
        $addFields: {
          bookList: { $slice: ["$bookList", 5] },
        },
      }, //这个是限制显示几条的，默认设定5条
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门书籍",
      bookList: await Book.find()
        .where({
          category: { $in: subCats },
        })
        .limit(5)
        .lean(),
    });
    res.send(cats);
  });
  //完整商城接口(无数量限制)
  router.get("/books/list/more", authMiddleware(), async (req, res) => {
    const parent = await Category.findOne({
      name: "商品分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "category",
          as: "bookList",
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门书籍",
      bookList: await Book.find()
        .where({
          category: { $in: subCats },
        })
        .limit(5)
        .lean(),
    });
    res.send(cats);
  });
  //商城书籍详情接口 + 相关推荐 related字段的创建
  router.get("/books/list/:id", authMiddleware(), async (req, res) => {
    const data = await Book.findById(req.params.id).populate("category").lean();
    data.related = await Book.find()
      .where({
        category: { $in: data.category },
      })
      .limit(2);
    res.send(data);
  });
  //购买确认页
  router.post("/books/pay/:id", authMiddleware(), async (req, res) => {
    const model = await UserBook.create(req.body);
    res.send(model._id);
  });
  /* end of shop */
  //vip课程
  router.get("/vip/video", authVipMiddleware(), async (req, res) => {
    const parent = await Category.findOne({
      name: "课程分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "category",
          as: "subjectList",
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门课程",
      subjectList: await Subject.find()
        .where({
          category: { $in: subCats },
        })
        .limit(5)
        .lean(),
    });
    res.send(cats);
  });
  //课程详情接口 + 相关推荐 related字段的创建
  router.get("/vip/video/:id", authMiddleware(), async (req, res) => {
    const data = await Subject.findById(req.params.id)
      .populate("category")
      .lean();
    data.related = await Subject.find()
      .where({
        category: { $in: data.category },
      })
      .limit(2);
    res.send(data);
  });
  /* end of vip */
  //复习备考
  router.get("/tests/list", authMiddleware(), async (req, res) => {
    const parent = await Category.findOne({
      name: "备考分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "category",
          as: "testList",
        },
      },
      {
        $addFields: {
          testList: { $slice: ["$testList", 5] },
        },
      }, //这个是限制显示几条的，默认设定5条
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "最新最热",
      testList: await Article.find()
        .where({
          category: { $in: subCats },
        })
        .populate("category")
        .limit(5)
        .lean(),
    });
    cats.map((cat) => {
      cat.testList.map((test) => {
        test.categoryName = cat.name;
        return test;
      });
      return cat;
    });
    res.send(cats);
  });
  //完整复习备考模块
  router.get("/tests/list/more", authMiddleware(), async (req, res) => {
    const parent = await Category.findOne({
      name: "备考分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "category",
          as: "testList",
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "最新最热",
      testList: await Article.find()
        .where({
          category: { $in: subCats },
        })
        .populate("category")
        .limit(5)
        .lean(),
    });
    cats.map((cat) => {
      cat.testList.map((test) => {
        test.categoryName = cat.name;
        return test;
      });
      return cat;
    });
    res.send(cats);
  });
  /* end of others */
  //公共论坛列表(所有人可见)
  router.get("/forum/list", authMiddleware(), async (req, res) => {
    const model = await Paper.find().populate("author").limit();
    res.send(model);
  });
  //创建/发布帖子
  router.post("/forum", authMiddleware(), async (req, res) => {
    const model = await Paper.create(req.body);
    res.send(model);
  });
  //帖子详情
  router.get("/forum/list/:id", authMiddleware(), async (req, res) => {
    const data = await Paper.findById(req.params.id).populate("author").lean();
    res.send(data);
  });
  //帖子回复
  router.put("/forum/:id", authMiddleware(), async (req, res) => {
    const data = await Paper.findByIdAndUpdate(req.params.id, req.body);
    res.send(data);
  });
  /* end of forum */
  //会员问题列表(仅vip可见)
  router.get("/matter/list", authVipMiddleware(), async (req, res) => {
    const model = await Matter.find().limit();
    res.send(model);
  });
  //创建/发布问题
  router.post("/matter", authMiddleware(), async (req, res) => {
    const model = await Matter.create(req.body);
    res.send(model);
  });
  //问题详情
  router.get("/matter/list/:id", authMiddleware(), async (req, res) => {
    const data = await Matter.findById(req.params.id).lean();
    res.send(data);
  });
  /* end of matter */
  //当前登录用户信息
  router.get("/consumer", async (req, res) => {
    const token = String(req.headers.authorization || "")
      .split(" ")
      .pop();
    const { id } = jwt.verify(token, req.app.get("secret"));
    req.user = await User.findById(id)
      .populate({
        path: "purchased",
        populate: {
          path: "book",
        },
      })
      .lean();
    res.send(req.user);
  });
  //修改当前用户信息
  router.put("/consumer/edit/:id", authMiddleware(), async (req, res) => {
    const username = req.body.username;
    if (User.findOne(username)) {
      return res.status(422).send({
        message: "用户已存在",
      });
    } else {
      const data = await User.findByIdAndUpdate(req.params.id, req.body);
      res.send(data);
    }
  });
  //提交确认购买信息
  router.put(
    "/consumer/confirm/edit/:id",
    authMiddleware(),
    async (req, res) => {
      const data = await User.findByIdAndUpdate(req.params.id, req.body);
      res.send(data);
    }
  );
  //修改当前用户密码
  router.put(
    "/consumer/password/edit/:id",
    authMiddleware(),
    async (req, res) => {
      const data = await User.findByIdAndUpdate(req.params.id, req.body);
      res.send(data);
    }
  );
  //开通vip
  router.put("/consumer/vip/edit/:id", authMiddleware(), async (req, res) => {
    const data = await User.findByIdAndUpdate(req.params.id, req.body);
    res.send(data);
  });
  //当前用户发帖记录
  router.get("/consumer/paper", authMiddleware(), async (req, res) => {
    const token = String(req.headers.authorization || "")
      .split(" ")
      .pop();
    const { id } = jwt.verify(token, req.app.get("secret"));
    req.user = await User.findById(id);
    const model = await Paper.find({ author: id }).limit();
    res.send(model);
  });
  //删除历史发帖记录
  router.delete("/consumer/paper/:id", authMiddleware(), async (req, res) => {
    const data = await Paper.findByIdAndDelete(req.params.id, req.body);
    res.send(data);
  });
  //删除购买记录
  router.delete("/consumer/book/:id", authMiddleware(), async (req, res) => {
    const data = await UserBook.findByIdAndDelete(req.params.id, req.body);
    res.send(data);
  });
  /* end of user */
  //用户注册
  router.post("/signup", async (req, res) => {
    const data = req.body.username;
    const name = await User.findOne().where({ username: data });
    if (name != null) {
      res.status(422).send({
        message: "用户名已被占用",
      });
      return;
    } else {
      const data = await User.create(req.body);
      res.send(data);
    }
  });
  //用户登录
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    //1.根据用户名找用户
    const user = await User.findOne({ username }).select("+password");
    assert(user, 422, "用户不存在");
    //2.校验密码
    const isValid = require("bcryptjs").compareSync(password, user.password);
    assert(isValid, 422, "密码错误");
    //3.返回token
    const token = jwt.sign({ id: user._id }, app.get("secret"));
    res.send({ token });
  });
  app.use("/web/api", router);
  //错误处理函数
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
  });
};

const express = require("../index");
// const express = require("express");
const app = express();

app.use(function (req, res, next) {
  console.log("没有路径前缀要求的中间件");
  //   next("第一个位置错了");
  next();
});
// 中间件是前缀匹配, /water/index也可以
app.use("/water", function (req, res, next) {
  console.log("过滤杂质");
  next();
});
app.get("/water", function (req, res) {
  console.log("return water");
  res.end("water");
});

app.use(function (err, req, res, next) {
  console.log("出错了," + err);
  next();
});
// use 第二个参数可以传路由对象， get不可以
// use是前缀匹配  get是完全匹配
app.listen(8080, function () {
  console.log(`server started at http://localhost:8080`);
});

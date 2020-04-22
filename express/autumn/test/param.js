const express = require("../index");
// const express = require("express");
const app = express();

// http://localhost:8080/user?name=qpf&age=18
// app.get("/user", function (req, res) {
//   console.log(req.query);
//   console.log(req.path);
//   console.log(req.hostname);
// });

// http://localhost:8080/user/qpf/18
// 这种use 路由是完全匹配，不是前缀匹配
app.use("/user/:name/:age", function (req, res, next) {
  console.log(req.params);
  next();
});
app.use("/user/:name/:age/11", function (req, res, next) {
  console.log("11", req.params);
  next();
});
app.get("/user/:name/:age", function (req, res, next) {
  console.log(req.params);
  res.end("ok");
});
app.listen(8080, function () {
  console.log(`server started at http://localhost:8080`);
});

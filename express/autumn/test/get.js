const express = require("../index");

const app = express();

app.get("/hello", function (req, res) {
  res.end("hello");
});

app.get("/world", function (req, res) {
  res.end("world");
});

app.listen(8080, function () {
  console.log(`server started at http://localhost:8080`);
});

const express = require("../index");

const app = express();

app.get("/hello", function (req, res) {
  res.end("hello");
});

app.post("/hello", function (req, res) {
  res.end("hello");
});

app.all("/hello", function (req, res) {
  res.end("hello");
});

app.all("*", function (req, res) {
  res.end("hello");
});
// curl -X POST http://localhost:8080/hellosadas
app.listen(8080, function () {
  console.log(`server started at http://localhost:8080`);
});

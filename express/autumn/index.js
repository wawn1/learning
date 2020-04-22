const http = require("http");
const url = require("url");

const getPathName = (req) => url.parse(req.url, true)["pathname"];
const isMiddle = (route) => route.method === "middle";
const prefixWith = (path, prefix) => prefix === "/" || path.startsWith(prefix + "/") || path === prefix;
const isErrorHandler = (fn) => fn.length === 4;
const routeMatch = (req, route) =>
  !isMiddle(route) &&
  (route.method === req.method.toLowerCase() || route.method === "all") &&
  (route.path === getPathName(req) || route.path === "*");
const middleMatch = (route, path) => isMiddle(route) && prefixWith(path, route.path);
const errorMiddleMatch = (route, path) => isMiddle(route) && prefixWith(path, route.path) && isErrorHandler(route.handler);

function createApplication() {
  let app = function (req, res) {
    const pathname = getPathName(req);

    let index = 0;
    function next(err) {
      if (index === app.routes.length) {
        res.end(`Cannot ${req.method} ${pathname}`);
        return;
      }
      let route = app.routes[index++];
      // console.log(err, errorMiddleMatch(route, pathname));
      // 判断1.是中间件 2. 路径前缀匹配, 3.是错误处理中间件
      if (err && errorMiddleMatch(route, pathname)) {
        route.handler(err, req, res, next);
      }
      // 中间件 路径前缀匹配   / 完全相等 或者 /user/111  结尾带/的开头
      else if (!err && middleMatch(route, pathname)) {
        route.handler(req, res, next);
      }
      // 路由  method 和path完全匹配
      else if (!err && routeMatch(req, route)) {
        route.handler(req, res, next);
      } else {
        if (err) next(err);
        else next();
      }
    }
    next();
  };
  app.listen = function () {
    let server = http.createServer(app);
    server.listen.apply(server, arguments);
  };
  // 保存路由规则
  app.routes = [];
  http.METHODS.push("all");
  http.METHODS.forEach(function (method) {
    method = method.toLowerCase();
    app[method] = function (path, handler) {
      app.routes.push({
        method,
        path,
        handler,
      });
    };
  });
  app["use"] = function (path, handler) {
    if (typeof path === "function") {
      handler = path;
      path = "/";
    }
    app.routes.push({
      method: "middle",
      path,
      handler,
    });
  };
  return app;
}
module.exports = createApplication;

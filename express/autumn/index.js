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
const pathParamMatch = (route, path) => route.paramsNames && path.match(route.reg_path);
const getParams = (route, path) => {
  if (route.paramsNames) {
    // 有说明是restApi路由规则
    let matchers = path.match(route.reg_path);
    // 如果路由不匹配是null
    if (matchers) {
      let params = {};
      for (let i = 0; i < route.paramsNames.length; i++) {
        params[route.paramsNames[i]] = matchers[i + 1];
      }
      return params;
    }
  }
  return null;
};

// 1. 把原来的路径转化为正则表达式
// 2. 提取变量名
// str $1 $2 index origin
// 如果要修改传入的对象，放在函数最后一次性修改，十分清晰
const formatParams = (layer) => {
  let {path} = layer;
  if (path.includes(":")) {
    let paramsNames = [];
    path = path.replace(/:([^\/]+)/g, function () {
      paramsNames.push(arguments[1]);
      return "([^/]+)";
    });
    layer.path = path;
    layer.reg_path = new RegExp(path);
    layer.paramsNames = paramsNames;
  }
};
const constructLayer = (method, path, handler) => {
  const layer = {method, path, handler};
  formatParams(layer);
  return layer;
};

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
      // 路由  method 和path完全匹配
      else if (!err && (middleMatch(route, pathname) || routeMatch(req, route) || pathParamMatch(route, pathname))) {
        // 添加req.params  路径参数
        let params = getParams(route, pathname);
        if (params) req.params = params;

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
      app.routes.push(constructLayer(method, path, handler));
    };
  });
  app["use"] = function (path, handler) {
    if (typeof path === "function") {
      handler = path;
      path = "/";
    }
    app.routes.push(constructLayer("middle", path, handler));
  };
  // 系统内置中间件，用来为请求和响应对象添加一些方法和属性
  app.use(function (req, res, next) {
    const urlObj = url.parse(req.url, true);
    req.path = urlObj.pathname;
    req.query = urlObj.query;
    req.hostname = req.headers["host"].split(":")[0];
    next();
  });

  return app;
}
module.exports = createApplication;

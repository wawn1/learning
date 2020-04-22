const http = require("http");
const url = require("url");
function createApplication() {
  let app = function (req, res) {
    const {pathname} = url.parse(req.url, true);
    for (let i = 0; i < app.routes.length; i++) {
      let route = app.routes[i];
      if (route.method === req.method.toLowerCase() && route.path === pathname) {
        return route.handler(req, res);
      }
    }
    res.end(`Cannot ${req.method} ${pathname}`);
  };
  app.listen = function () {
    let server = http.createServer(app);
    server.listen.apply(server, arguments);
  };
  // 保存路由规则
  app.routes = [];
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
  return app;
}
module.exports = createApplication;
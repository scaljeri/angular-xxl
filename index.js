const routeDecorators = require('./bundle/route-decorators');
const routeDecoratorFactory = routeDecorators.routeDecoratorFactory;

exports.RouteXxlConfig = routeDecorators.RouteXxlConfig;

exports.RouteData = routeDecoratorFactory('data');
exports.RouteParams = routeDecoratorFactory('params');
exports.RouteQueryParams = routeDecoratorFactory('queryParams');

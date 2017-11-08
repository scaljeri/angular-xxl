"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var route_decorators_1 = require("./bundle/route-decorators");
exports.RouteData = route_decorators_1.routeDecoratorFactory('data');
exports.RouteParams = route_decorators_1.routeDecoratorFactory('params');
exports.RouteQueryParams = route_decorators_1.routeDecoratorFactory('queryParams');

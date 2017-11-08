import { routeDecoratorFactory, RouteXxlConfig } from "./bundle/route-decorators";

export { RouteXxlConfig };

export const RouteData = routeDecoratorFactory('data');
export const RouteParams = routeDecoratorFactory('params');
export const RouteQueryParams = routeDecoratorFactory('queryParams');

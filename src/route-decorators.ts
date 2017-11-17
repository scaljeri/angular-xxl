import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/observable/combineLatest';

/**
 * Traverses the routes, from the current route all the way up to the
 * root route and stores the for each route data, params or queryParams observable
 *
 * @param {ActivatedRoute} parent
 * @param {string} routeProperty
 * @returns {Observable<Data | Params>[]}
 */
function extractRoutes(parent, routeProperty): Observable<any>[] {
    const routes = [];

    while (parent) {
        routes.push(parent[routeProperty]);
        parent = parent.parent;
    }

    return routes;
}

/**
 * Merge all observables from {@link extractRoutes} into a single stream passing through only the data/params
 * of decorator. Depending on how the decorator was initialized (`{observable: false}`) the observable or the actual
 * values are passed into the callback.
 *
 * @param {Observable<Data | Params>[]} routes
 * @param {string[]} args list of the decorator's arguments
 * @param {RouteConfigXxl} config the decorator's configuration object
 * @param {(Observable<any> | any) => void} cb callback function receiving the final observable or the actual values as its arguments
 */
function extractValues(routes, args, config, cb): void {
    const stream$ = combineLatest(of(null), ...routes, (...routeValues) => {
            const values = routeValues.reduce((obj, route) => {
                args.forEach(arg => {
                    if (route && route[arg] !== undefined) {
                        obj[arg] = route[arg];
                    }
                });

                return obj;
            }, {});

            return args.length === 1 ? values[args[0]] : values;
        });

    if (config.observable === false) {
        stream$.subscribe(cb);
    } else {
        cb(stream$);
    }
}

/**
 * The configuration interface used to configure the decorators
 */
export interface RouteXxlConfig {
    observable?: boolean;
}

/**
 * Factory function which creates decorators for resolved route data, route params or query parameters.
 *
 * @param {string} routeProperty used to create a data, params or queryParams decorator function
 * @returns {(...args: string | RouteXxlConfig[]) => any}
 */
function routeDecoratorFactory(routeProperty) {
    return (...args: Array<string | RouteXxlConfig>): any =>  {
        const config = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as RouteXxlConfig;

        return (target: any, key: string, index: number): void => {
            const ngOnInit = target.ngOnInit;

            if (!args.length) {
                args = [key.replace(/\$$/, '')];
            }

            target.ngOnInit = function(): void {
                if (!this.route) {
                    throw(`${target.constructor.name} uses the ${routeProperty} @decorator without a 'route' property`);
                }

                const routes = routeProperty === 'queryParams' ? [this.route.queryParams] : extractRoutes(this.route, routeProperty);

                extractValues(routes, args, config, values => {
                    this[key] = values;
                });

                this.ngOnInit = ngOnInit;
                if (ngOnInit) {
                    this.ngOnInit();
                }
            };
        };
    };
}

export function RouteData(...args: Array<string | RouteXxlConfig>): any {
    const handler = routeDecoratorFactory('data');

    return handler(...args);
}

export function RouteParams(...args: Array<string | RouteXxlConfig>): any {
    const handler = routeDecoratorFactory('params');

    return handler(...args);
}

export function RouteQueryParams(...args: Array<string | RouteXxlConfig>): any {
    const handler = routeDecoratorFactory('queryParams');

    return handler(...args);
}

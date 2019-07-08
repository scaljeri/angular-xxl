import {OperatorFunction, Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface RouteXxlConfig {
    observable?: boolean;
    pipe?: Array<OperatorFunction<any, any>>;
    inherit?: boolean;
}

/**
 * Traverses the routes, from the current route all the way up to the
 * root route and stores each for the route data, params or queryParams observable
 *
 * @param {ActivatedRoute} parent
 * @param {string} routeProperty
 * @returns {Observable<Data | Params>[]}
 */
function extractRoute(parent: any, routeProperty: string, inherit = false): Observable<any> {
    if (inherit) {
        // Move up to the highest level
        while (parent.firstChild) {
            parent = parent.firstChild;
        }
    }

    return parent[routeProperty];
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
function extractValues(args: string[], stream$: Observable<any>): Observable<any> {
    return stream$.pipe(
        map(routeValues => {
            const values = args.reduce((data, arg) => {
                if (routeValues && routeValues[arg]) {
                    data[arg] = routeValues[arg];
                }

                return data;
            }, {});

            return args.length === 1 ? values[args[0]] : values;
        }),
    );
}

/**
 * Factory function which creates decorators for resolved route data, route params or query parameters.
 *
 * @param {string} routeProperty used to create a data, params or queryParams decorator function
 * @returns {(...args: string | RouteXxlConfig[]) => PropertyDecorator}
 */
function routeDecoratorFactory(routeProperty, args, extractor?): PropertyDecorator {
    const config = (typeof args[args.length - 1] === "object" ? args.pop() : {}) as RouteXxlConfig;

    return (prototype: { ngOnInit(): void }, key: string): void => {
        if (!args.length) {
            args = [key.replace(/\$$/, "")];
        }

        // `ngOnInit` should exist on the component, otherwise the decorator will not work with the AOT compiler!!
        if (!prototype.ngOnInit) {
            throw (new Error(`${prototype.constructor.name} uses the ${routeProperty} @decorator without implementing 'ngOnInit'`));
        }

        const ngOnInit = prototype.ngOnInit;

        prototype.ngOnInit = function(): void {
            // Finally we have the instance!!
            if (!this.route) {
                throw (new Error(`${this.constructor.name} uses a route-xxl @decorator without a 'route: ActivatedRoute' property`));
            }

            let stream$ = extractor(this.route, routeProperty, config.inherit);
            stream$ = extractValues(args, stream$);

            if (config.pipe) {
                stream$ = stream$.pipe(...config.pipe);
            }

            if (config.observable === false) {
                stream$.subscribe(data => {
                    this[key] = data;
                });
            } else {
                this[key] = stream$;
            }

            ngOnInit.call(this);
        };
    };
}

/*
The factory is wrapped in a function for the AOT compiler
 */
export function RouteData(...args: Array<string | RouteXxlConfig>): PropertyDecorator {
    return routeDecoratorFactory("data", args, extractRoute);
}

export function RouteParams(...args: Array<string | RouteXxlConfig>): PropertyDecorator {
    return routeDecoratorFactory("params", args, extractRoute);
}

export function RouteQueryParams(...args: Array<string | RouteXxlConfig>): PropertyDecorator {
    return routeDecoratorFactory("queryParams", args, route => route.queryParams);
}

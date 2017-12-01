import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

interface XxlPropertyConfig {
    prototype: any;
    args: string[];
    key: string;
    routeProperty: string;
    config: RouteXxlConfig;
    extractor(route: any, routeProperty: string, inherit?: boolean): Observable<any>;
}

interface XxlState {
    isUsed?: boolean;
    properties: XxlStateProperty;
    prototype: any;
    tunnel$: Subject<any>;
}

interface XxlStateProperty {
    args: string[];
    configs: XxlPropertyConfig[];
}

export interface RouteXxlConfig {
    observable?: boolean;
    inherit?: boolean;
}

/**
 * Traverses the routes, from the current route all the way up to the
 * root route and stores the for each route data, params or queryParams observable
 *
 * @param {ActivatedRoute} parent
 * @param {string} routeProperty
 * @returns {Observable<Data | Params>[]}
 */
function extractRoutes(parent: any, routeProperty: string, inherit = false): Observable<any> {
    const routes = [];

    if (inherit) {
        while (parent.firstChild) {
            parent = parent.firstChild;
        }
    }

    while (parent) {
        routes.push(parent[routeProperty]);
        parent = parent.parent;
    }

    return combineLatest(...routes);
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
                routeValues.forEach(value => {
                    if (value && value[arg]) {
                        data[arg] = value[arg];
                    }
                });

                return data;
            }, {});

            return args.length === 1 ? values[args[0]] : values;
        }),
    );
}

function replaceNgOnInit(prototype: any): void {
    const ngOnInit = prototype.ngOnInit;

    prototype.ngOnInit = function xxlFake(): void {
        if (!this.route) {
            throw(new Error(`${this.constructor.name} uses a route-xxl @decorator without a 'route: ActivatedRoute' property`));
        }

        const state: XxlState = this.__xxlState;
        // state.isUsed = true;

        for (const routeProperty in state.properties) {
            if (state.properties.hasOwnProperty(routeProperty)) {
                const items = state.properties[routeProperty];

                items.configs.forEach(item => {
                    if (routeProperty === 'tunnel') {
                        this[item.key] = state.tunnel$ || (state.tunnel$ = new Subject<any>());
                    } else {
                        // build stream
                        let stream$ = item.extractor(this.route, routeProperty, item.config.inherit);
                        stream$ = extractValues(item.args, stream$);

                        if (item.config.observable === false) {
                            stream$.subscribe(data => {
                                this[item.key] = data;
                            });
                        } else {
                            this[item.key] = stream$;
                        }
                    }
                });
            }
        }

        ngOnInit.call(this);
    };
}

function updateState(state: XxlState, cfg: XxlPropertyConfig): void {
    const property = state.properties[cfg.routeProperty] ||
        (state.properties[cfg.routeProperty] = { configs: [], args: [] } as XxlStateProperty);

    // TODO: Implement global list for better performance
    // property.args.push(...cfg.args.filter(arg => property.args.indexOf(arg) === +1));
    property.configs.push(cfg);
}

/**
 * Factory function which creates decorators for resolved route data, route params or query parameters.
 *
 * @param {string} routeProperty used to create a data, params or queryParams decorator function
 * @returns {(...args: string | RouteXxlConfig[]) => PropertyDecorator}
 */
function routeDecoratorFactory(routeProperty, args, extractor?): PropertyDecorator {
    const config = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as RouteXxlConfig;

    return (prototype: { __xxlState: XxlState, ngOnInit(): void }, key: string): void => {
        if (!args.length) {
            args = [key.replace(/\$$/, '')];
        }

        // `ngOnInit` should exist on the component, otherwise the decorator will not work with the AOT compiler!!
        if (!prototype.ngOnInit) {
            throw(new Error(`${prototype.constructor.name} uses the ${routeProperty} @decorator without implementing 'ngOnInit'`));
        }

        const state = prototype.__xxlState || (prototype.__xxlState = { prototype, properties: {} } as XxlState);

        replaceNgOnInit(prototype);
        updateState(state, {args, config, extractor, key, prototype, routeProperty});
    };
}

/*
The factory is wrapped in a function for the AOT compiler
 */
export function RouteData(...args: Array<string | RouteXxlConfig>): PropertyDecorator {
    return routeDecoratorFactory('data', args, extractRoutes);
}

export function RouteParams(...args: Array<string | RouteXxlConfig>): PropertyDecorator {
    return routeDecoratorFactory('params', args, extractRoutes);
}

export function RouteQueryParams(...args: Array<string | RouteXxlConfig>): PropertyDecorator {
    return routeDecoratorFactory('queryParams', args, route => route.queryParams.pipe(map(params => [params])));
}

export function RouteTunnel(): PropertyDecorator {
    return routeDecoratorFactory('tunnel', []);
}

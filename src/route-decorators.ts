import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Subject } from 'rxjs/Subject';

/**
 * The configuration interface used to configure the decorators
 */
export interface RouteXxlConfig {
    observable?: boolean;
    inherit?: boolean;
}

interface StateItem {
    args: Array<string>;
    extractor: (route: any, routeProperty: string, inherit?: boolean) => Observable<any>;
    maps: { [key: string]: { config: RouteXxlConfig, args: Array<string> } };
    stream$?: Observable<any>;
}

interface State {
    types: { [key: string]: StateItem };
    ngOnInit: () => void;
    counter: number;
    tunnel: Subject<any>;

}

interface StateConfig {
    args: Array<string>
    config: RouteXxlConfig;
    extractor: () => Observable<any>;
    key: string;
    routeProperty: string;
}

interface FakeNgOnInit {
    (): void;

    _state: State;
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

    return routes.length === 1 ? routes[0].pipe(map(value => [value])) : combineLatest(...routes);
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
                routeValues.forEach(values => {
                    if (values && values[arg]) {
                        data[arg] = values[arg];
                    }
                });

                return data;
            }, {});

            return args.length === 1 ? values[args[0]] : values;
        })
    );
}

function buildFakeNgOnInit(ngOnInit: () => void): FakeNgOnInit {
    let fakeNgOnInit = function fake(): void {
        const state: State = (fake as FakeNgOnInit)._state;

        if (!this.route) {
            throw(new Error(`${this.constructor.name} uses a route-xxl @decorator without a 'route: ActivatedRoute' property`));
        }

        for (let routeProperty in state.types) {
            const item = state.types[routeProperty];

            if (state.types.hasOwnProperty(routeProperty)) {
                if (!item.stream$) {
                    item.stream$ = item.extractor(this.route, routeProperty, true);
                }

                for (let key in item.maps) {
                    if (routeProperty === 'tunnel') {
                        this[key] = state.tunnel;
                    } else {
                        const mapItem = item.maps[key];
                        const stream$ = extractValues(mapItem.args, (mapItem.config.inherit ? item.stream$ : item.extractor(this.route, routeProperty)));

                        if (mapItem.config.observable === false) {
                            stream$.subscribe(data => {
                                this[key] = data;
                            });
                        } else {
                            this[key] = stream$
                        }
                    }
                }
            }
        }

        this.ngOnInit = ngOnInit;
        this.ngOnInit();
    } as FakeNgOnInit;

    fakeNgOnInit._state = {ngOnInit, types: {}, counter: 0, tunnel: new Subject<any>()} as State;

    return fakeNgOnInit;
}

function updateNgOnInitState(state: State, prop: StateConfig): void {
    if (!state.types[prop.routeProperty]) {
        state.types[prop.routeProperty] = {extractor: prop.extractor, args: [], maps: {}} as StateItem;
    }

    state.types[prop.routeProperty].args.push(...prop.args);
    state.types[prop.routeProperty].maps[prop.key] = {config: prop.config, args: prop.args};
}

/**
 * Factory function which creates decorators for resolved route data, route params or query parameters.
 *
 * @param {string} routeProperty used to create a data, params or queryParams decorator function
 * @returns {(...args: string | RouteXxlConfig[]) => PropertyDecorator}
 */
function routeDecoratorFactory(routeProperty, args, extractor): PropertyDecorator {
    const config = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as RouteXxlConfig;

    return (prototype: { ngOnInit: FakeNgOnInit }, key: string): void => {
        if (!args.length) {
            args = [key.replace(/\$$/, '')];
        }

        // `ngOnInit` should exist on the component, otherwise the decorator will not work with the AOT compiler!!
        if (!prototype.ngOnInit) {
            throw(new Error(`${prototype.constructor.name} uses the ${routeProperty} @decorator without implementing 'ngOnInit'`));
        }

        // Replace ngOnInit only once
        if (!prototype.ngOnInit._state) {
            prototype.ngOnInit = buildFakeNgOnInit(prototype.ngOnInit);
        }

        updateNgOnInitState(prototype.ngOnInit._state, {args, config, extractor, key, routeProperty});
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
    return routeDecoratorFactory('tunnel', [], () => {
    });
}

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as sinon from 'sinon';


export interface Route {
    data?: any;
    params?: Observable<{[key: string]: string}>;
    queryParams?: Observable<{[key: string]: string}>;
    parent?: Route;
    firstChild?: Route;
}

let route: Route;
let subjects: Array<BehaviorSubject<any>>;

function buildRoute(property): Route   {
    subjects = [new BehaviorSubject(null), new BehaviorSubject(null), new BehaviorSubject(null)];

    route = {
        [property]: subjects[0].asObservable(),
        parent: {
            [property]: subjects[1].asObservable(),
            parent: {
                [property]: subjects[2].asObservable(),
            } as Route
        } as Route
    };

    route.parent.firstChild = route;
    route.parent.parent.firstChild = route.parent;

    return route;
}

export function updateRoute(level, data): void {
    subjects[level].next(data);
}

export function setup(property): {instances: Array<any>, Comp: any, route: Route, spy: any} {
    const route = buildRoute(property);

    const Comp = function(route) {
        this.route = route;
    };

    Comp.prototype.ngOnInit = sinon.spy();

    // Create an instance at each route/parent
    const instances = [];
    let parent = route;
    for( let i = 0; i < 3; i++) {
        instances.push( new Comp(parent));

        parent = route.parent;
    }

    return {instances, Comp, route, spy: Comp.prototype.ngOnInit};
}


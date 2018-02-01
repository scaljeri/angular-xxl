import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';

import * as sinon from 'sinon';
import {Subject} from "rxjs/Subject";

export interface Route {
    data?: any;
    params?: Observable<{ [key: string]: string }>;
    queryParams?: Observable<{ [key: string]: string }>;
    parent?: Route;
    firstChild?: Route;
}

let route: Route;
let subjects: Array<BehaviorSubject<any>>;

function buildRoute(property): any {
    subjects = [new BehaviorSubject(null), new BehaviorSubject(null), new BehaviorSubject(null)];

    // Each  route inherits the data from it parents (paramsInheritanceStrategy)
    route = {
        [property]: subjects[0].asObservable(),
        firstChild: {
            [property]: combineLatest(subjects[0], subjects[1]).pipe(
                map(([obj1, obj2]) => Object.assign({}, obj1, obj2))),
            firstChild: {
                [property]: combineLatest(subjects[0], subjects[1], subjects[2])
                    .pipe(
                        map(([obj1, obj2, obj3]) => Object.assign({}, obj1, obj2, obj3)),
                    ),
            } as Route,
        } as Route,
    };

    route.firstChild.parent = route;
    route.firstChild.firstChild.parent = route.firstChild;

    return [route, subjects];
}

export function updateRoute(level, data): void {
    subjects[level].next(data);
}

export class Foo {
    a$: Observable<any>;
    ab$: Observable<any>;
    foc$: Observable<any>;
    foc: any;
    tunnel: any;

    constructor(private route: any) {}

    ngOnInit(): void {}
}

export function build(property = 'data'): Foo[] {
    const [r, subs] = buildRoute(property);

    // Create an instance at each route/parent
    const foos = [];
    let child = r;
    for (let i = 0; i < 3; i++) {
        foos.push(new Foo(child));

        child = child.firstChild;
    }

    return foos;
}

export function enableQueryParams(): void {
    const subject = new BehaviorSubject(null);

    subjects = subjects.map(() => subject);

    let child = route;
    while (child) {
        child.queryParams = subject.asObservable();

        child = child.firstChild;
    }
}

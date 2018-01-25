import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as sinon from 'sinon';

export interface Route {
    data?: any;
    params?: Observable<{ [key: string]: string }>;
    queryParams?: Observable<{ [key: string]: string }>;
    parent?: Route;
    firstChild?: Route;
}

interface OnInit {
    ngOnInit(): void;
}

let route: Route;
let subjects: Array<BehaviorSubject<any>>;

function buildRoute(property): any {
    subjects = [new BehaviorSubject(null), new BehaviorSubject(null), new BehaviorSubject(null)];

    route = {
        [property]: subjects[0].asObservable(),
        firstChild: {
            [property]: subjects[1].asObservable(),
            firstChild: {
                [property]: subjects[2].asObservable(),
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

export class Foo implements OnInit {
    a$: Observable<any>;
    ab$: Observable<any>;
    foc$: Observable<any>;
    foc: any;
    tunnel$: Subject<any>;

    constructor(private route: any) {
    }

    ngOnInit(): void {
    }
}

export class Bar implements OnInit {
    a$: Observable<any>;
    ab$: Observable<any>;
    bac$: Observable<any>;
    bac: any;
    tunnel$: Subject<any>;

    constructor(public route: any) {
    }

    ngOnInit(): void {
    }
}

// Cleanup
export function setup(): void {
    Foo.prototype.ngOnInit = sinon.spy();
    Bar.prototype.ngOnInit = sinon.spy();

    delete Foo.prototype['__xxlState'];
    delete Bar.prototype['__xxlState'];
}

export function build(property = 'data'): { foos: Foo[], bars: Bar[], route: Route, subjects: BehaviorSubject<any>[] } {
    const [r, subs] = buildRoute(property);

    // Create an instance at each route/parent
    const foos = [];
    const bars = [];
    let child = r;
    for (let i = 0; i < 3; i++) {
        foos.push(new Foo(child));
        bars.push(new Bar(child));

        child = child.firstChild;
    }

    return {foos, bars, route: r, subjects: subs};
}

export function enableQueryParams(route): BehaviorSubject<any> {
    const subject = new BehaviorSubject(null);

    let child = route;
    while (child) {
        child.queryParams = subject.asObservable();

        child = child.firstChild;
    }

    return subject;
}

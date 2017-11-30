import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as sinon from 'sinon';
import { Subject } from 'rxjs/Subject';


export interface Route {
    data?: any;
    params?: Observable<{[key: string]: string}>;
    queryParams?: Observable<{[key: string]: string}>;
    parent?: Route;
    firstChild?: Route;
}

interface OnInit {
    ngOnInit: () => void;
}

let route: Route;
let subjects: Array<BehaviorSubject<any>>;

function buildRoute(property): any   {
    subjects = [new BehaviorSubject(null), new BehaviorSubject(null), new BehaviorSubject(null)];

    route = {
        [property]: subjects[0].asObservable(),
        firstChild: {
            [property]: subjects[1].asObservable(),
            firstChild: {
                [property]: subjects[2].asObservable(),
            } as Route
        } as Route
    };

    route.firstChild.parent = route;
    route.firstChild.firstChild.parent = route.firstChild;

    return [route, subjects];
}

export function updateRoute(level, data): void {
    subjects[level].next(data);
}

export class Foo implements OnInit {
    public a$: Observable<any>;
    public ab$: Observable<any>;
    public foc$: Observable<any>;
    public foc: any;
    public tunnel$: Subject<any>;
    constructor(public route: any) {}
    ngOnInit(): void {}
}

export class Bar implements OnInit {
    public a$: Observable<any>;
    public ab$: Observable<any>;
    public bac$: Observable<any>;
    public bac: any;
    public tunnel$: Subject<any>;
    constructor(public route: any) {}
    ngOnInit(): void {}
}

export function setup() {
    Foo.prototype.ngOnInit = sinon.spy();
    Bar.prototype.ngOnInit = sinon.spy();

    delete Foo.prototype['__xxlState'];
    delete Bar.prototype['__xxlState'];
}

export function build(property = 'data'): {foos: Foo[], bars: Bar[], route: Route, subjects: BehaviorSubject<any>[]} {
    const [route, subjects] = buildRoute(property);

    // Create an instance at each route/parent
    const foos = [];
    const bars = [];
    let child = route;
    for( let i = 0; i < 3; i++) {
        foos.push( new Foo(child));
        bars.push( new Bar(child));

        child = route.firstChild;
    }

    return {foos, bars, route, subjects};
}

export function enableQueryParams(route): BehaviorSubject<any> {
    const subject = new BehaviorSubject(null);

    let child = route;
    while(child) {
        child.queryParams = subject.asObservable();

        child = child.firstChild;
    }

    return subject;
}


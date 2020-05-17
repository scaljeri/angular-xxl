This library contains a couple of decorators which provide functionality useful for angular components. 

[![CircleCI](https://circleci.com/gh/scaljeri/angular-xxl.svg?style=svg)](https://circleci.com/gh/scaljeri/angular-xxl)
[![Coverage Status](https://coveralls.io/repos/github/scaljeri/angular-xxl/badge.svg?branch=master)](https://coveralls.io/github/scaljeri/angular-xxl?branch=master)

[![GitHub issues](https://img.shields.io/github/issues/scaljeri/angular-xxl.svg?style=plastic)](https://github.com/scaljeri/angular-xxl/issues)

The following decorators are available

  *  [@RouteData / @RouteParams / @RouteQueryParams](docs/ROUTE.md) - Easy route access 
  *  [@HostElement](docs/HOST_ELEMENT.md) - Monitor element dimensions
  *  [@Tunnel](docs/TUNNEL.md) - Communication between components
  
This library can be installed using `yarn`

    $> yarn add angular-xxl
    
Below is a short description of each `@decorator`

### @HostElement
This decorator monitors dimensions (width/height) of elements; The root element of the component and/or any of its children

```typescript
    @HostElement('width') width$: Observable<number>;
    @HostElement('width', {observable: false}) width: number;
    @HostElement('height', 'width'}) size$: Observable<{height: number, width: number};
```

[Read more](docs/HOST_ELEMENT.md)

[DEMO](https://stackblitz.com/edit/host-element?file=app%2Fnormal%2Fnormal.component.ts)

### @RouteData / @RouteParams / @RouteQueryParams
These decorators let you access the router's data, params and queryParams easily with just one line of code. 
 
```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
    @RouteData() contacts$: Observable<Contact[]>;
    @RouteParams('contactId', { observable: false}) contactId: string;
    @RouteQueryParams('search', { pipe: [map( x => x * 10)]}) search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {} // The `route` is required!
    
    ngOnInit(): void {} // This is required too
}
```

There is some flexibility in how the data is received in the component which is all described in more detail [here](docs/ROUTE.md).

[Read more](docs/ROUTE.md)

[Demo](https://stackblitz.com/edit/angular-route-xxl-g64g5p?file=app%2Futils%2Froute-decorator.ts)


### Tunnel
This decorator allows you to setup communication between instances of the same components/class.

[Read more](docs/TUNNEL.md)

[DEMO](https://stackblitz.com/edit/angular-tunnel?file=app%2Fblock%2Fblock.component.ts)

### TODO
  * Write polyfill for size-change detection using [this](https://stackoverflow.com/questions/6492683/how-to-detect-divs-dimension-changed)

### Contributors
   + @dirkluijk - Suggested to solve the issue using decorators
   + @superMDguy - Added `@RouteQueryParams()` and an option to return actual values instead of Observables

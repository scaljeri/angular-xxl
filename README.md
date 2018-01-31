This library contains a couple of decorators which add magic to angular components. 

[![CircleCI](https://circleci.com/gh/scaljeri/angular-route-xxl.svg?style=svg)](https://circleci.com/gh/scaljeri/angular-route-xxl)
[![Coverage Status](https://coveralls.io/repos/github/scaljeri/angular-route-xxl/badge.svg?branch=multiple-values)](https://coveralls.io/github/scaljeri/angular-route-xxl?branch=multiple-values)
[![GitHub issues](https://img.shields.io/github/issues/scaljeri/angular-route-xxl.svg?style=plastic)](https://github.com/scaljeri/angular-route-xxl/issues)

[Stackblitz demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar%2Ffoo-bar.component.ts)

The following decorators are available

  *  [@RouteData / @RouteParams / @RouteQueryParams](docs/ROUTE.md) 
  *  [@HostElement](docs/HOST_ELEMENT.md)
  *  [@Tunnel](docs/TUNNEL.md)
  
And they can be install with the following command

    $> yarn add angular-xxl
    
Below is a short description of each `@decorator`

### @HostElement
This decorator monitors dimensions (width/height) of elements; The root element and/or any of its children

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
export class ContactsComponent {
    @RouteData() contacts$: Observable<Contact[]>;
    @RouteParams('contactId', { observable: false}) contactId: string;
    @RouteQueryParams('search', { pipe: [map( x => x * 10)]}) search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit(): void {} // Without this it will not work if AOT enabled
}
```

There is some flexibility in how the data is received in the component which is all described in more detail [here](docs/ROUTE.md).

[Stackblitz demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar-default%2Ffoo-bar-default.component.ts)


### Tunnel
This decorator allows you to setup communication between instances of the same components/class.

[Read more](docs/TUNNEL.md)

### Bookmarks
  * Small polyfill: https://stackoverflow.com/questions/6492683/how-to-detect-divs-dimension-changed

### Contributors
   + @dirkluijk - Suggested to solve the issue using decorators
   + @superMDguy - Added `@RouteQueryParams()` and an option to return actual values instead of Observables

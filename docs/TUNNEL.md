https://stackoverflow.com/questions/6492683/how-to-detect-divs-dimension-changed
https://stackblitz.com/edit/host-element?file=app%2Futils%2Fhost-element.decorator.ts
https://stackblitz.com/edit/host-element?file=app%2Ffoobar%2Ffoobar.component.ts

https://stackblitz.com/edit/host-element?file=app%2Fapp.component.html

This library provides four decorators: **@RouteData**, **@RouteParams**, **@RouteQueryParams** and **@RouteTunnel**. The first three 
extract the resolved data, route parameters and query parameters values respectively using the `ActivatedRoute`. 

All decorators require that the `ActivatedRoute` is injected in the component's constructor as `route` and
that the component has the `ngOnInit` function defined. 

[![CircleCI](https://circleci.com/gh/scaljeri/angular-route-xxl.svg?style=svg)](https://circleci.com/gh/scaljeri/angular-route-xxl)
[![Coverage Status](https://coveralls.io/repos/github/scaljeri/angular-route-xxl/badge.svg?branch=multiple-values)](https://coveralls.io/github/scaljeri/angular-route-xxl?branch=multiple-values)
[![GitHub issues](https://img.shields.io/github/issues/scaljeri/angular-route-xxl.svg?style=plastic)](https://github.com/scaljeri/angular-route-xxl/issues)

[Stackblitz demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar%2Ffoo-bar.component.ts)

This library holds a couple of decorators which can add usefull functionality to your components easily. 

The following decorators are available

  *  [@RouteData / @RouteParams / @RouteQueryParams](docs/ROUTE.md) 
  *  [@HostElement](docs/HOST_ELEMENT.md)
  *  [@Tunnel](docs/TUNNEL.md)
  
Below is a short description of each decorator

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

For example, consider the following sibling components

```html
   <app-foo></app-foo>
   <app-foo></app-foo>
```
 
If, for whatever reason, you want them to be able to communicate using `@RouteTunnel` do

```typescript
    @Component({ ... })
    export class FooComponent implements ngOnInit {
        @RouteTunnel() tunnel$;
        
        constructor(private route: ActivatedRoute) {}
        
        ngOnInit(): void {
            this.tunnel$.subscribe(data => {
                if (data.sender !== this) { ... }
            });
        }
        
        doFooBarAction(): void {
            this.tunnel$.next({sender: this, action: 'foobar'});
        }
    }
```

The tunnel-decorator is not limited to sibling components only, it can also go straight through routes!
If you want to see this in action, go to the [demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar%2Ffoo-bar.component.ts)
and click on a route. The ripple effect is just that!

### Contributors
   + @dirkluijk - Suggested to solve the issue using decorators
   + @superMDguy - Added `@RouteQueryParams()` and an option to return actual values instead of Observables

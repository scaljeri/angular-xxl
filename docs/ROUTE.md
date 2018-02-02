There are three decorators dealing with the router: **@RouteData**, **@RouteParams** and **@RouteQueryParams**. 
They extract the resolved data, route parameters and query parameters values respectively using the `ActivatedRoute`. 

All decorators require that the `ActivatedRoute` is injected in the component's constructor as `route` and
that the component has the `ngOnInit` function defined. If you'r using AOT, make sure that you also implement the 
`OnInit` interface!

[DEMO](https://stackblitz.com/edit/angular-route-xxl-g64g5p?file=app%2Futils%2Froute-decorator.ts)

Before angular `v5.2` angular didn't allow you to inherit data between routes, which was sometimes very annoying, 
because a component needed to know which route resolved what 
 
```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit { // Implements OnInit for AOT
    contacts$: Observable<Contact[]>;
    contactId$: Observable<string>;
    search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit() {
        this.contacts$ = this.route.parent.parent.parent.parent.data.map(data => data['contacts']);
        this.contactId$ = this.route.parent.parent.parent.params.map(params => params['contactId']);
        this.search$ = this.route.queryParams.map(queryParams => queryParams['search']);
    }
}
```

Because of this limitation I wrote these decorators originally [here](https://github.com/scaljeri/angular-route-xxl)
**If your are still using an angular version below 5.2 use that project instead of this one!!**

But, angular now supports inheritance `parent -> children` so I rewrote the [old](https://github.com/scaljeri/angular-route-xxl)
project into this one.
 
Meaning, you have to set the route's inheritance strategy to `always` before you can use these decorators

```typescript
RouterModule.forRoot(routes, {
    paramsInheritanceStrategy: 'always', // 'always', // emptyOnly
})],
```

[DEMO](https://stackblitz.com/edit/angular-route-xxl-g64g5p?file=app%2Fapp.module.ts)

With the inheritance strategy in place, the above `ngOnInit` example can be simplified to

```typescript
this.contacts$ = this.route.data.map(data => data['contacts']);
this.contactId$ = this.route.map(params => params['contactId']);
this.search$ = this.route.queryParams.map(queryParams => queryParams['search']);
```
 
No more `parent.parent`. And finally, using the decorators the component turns into

```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
    @RouteData('contacts') contacts$: Observable<Contact[]>;
    @RouteParams('contactId') contactId$: Observable<string>;
    @RouteQueryParams('search') search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit(): void {} // Without this it will not work if AOT enabled
}
```

The argument of these decorators is optional only if the value is identical to the property name 
the decorator belongs to (ignoring the '$')

```typescript
@RouteData() contacts$: Observable<Contact[]>;
@RouteParams() contactId$: Observable<string>;
@RouteQueryParams() search$: Observable<string>;
```

Although angular took away the inheritance benefit these decorators provided, they can do a lot more, which
is describe below.

### Real values instead of Observables 

If what you need is the actual value instead of an Observable, add the `observable: false` config option
to the decorator

```typescript
@RouteData('contacts', { observable: false }) contacts: Contact[];
@RouteParams('contactId', { observable: false }) contactId: string;
@RouteQueryParams('search', { observable: false }) search: string;
```

Unlike the route snapshot, these values are automatically updated whenever the url changes.

### Multiple arguments
Above, each route value is injected into its own property on the component. But it is also possible
to merge them all into a single object

```typescript
@RouteParams('userId', 'itemId', 'messageId', {observable: false}) params;
// Usage: this.params.itemId   
```

or

```typescript
@RouteParams('userId', 'itemId', 'messageId') params$; 
```

This can be used for all three decorators.

### Route Inheritance
If you turn inheritance on

    @RouteData('foo', {inherit: true}) bar$;
    
`data` and `params` will behave exactly like `queryParams`, meaning that they
are globally accessible. In the [demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar%2Ffoo-bar.component.ts)
you can see this in action if you click `Inherit Routes`. This can be used for all three decorators.

### Lettable operators
This option lets you apply any lettable operator, like `filer` or `map` on the the route data, params and query-params before 
they propagates to your application. 

For example, if you need to ignore empty query params

```typescript
@RouteQueryParams('search', { observable: false, pipe: [filter(val => val !== '')] }) search: string;
```

or if values need to be transformed

```typescript
@RouteData('count', { observable: false, pipe: [map(val => val * 2) }) count: number;
```

Because it is an array, multiple lettable operators can be added, and will be executed in that same order.

### Angular 5.2
Angular now supports [`paramsInheritanceStrategy`](https://blog.angular.io/angular-5-2-now-available-312d1099bd81), it can be set to `always`, meaning child routes will have access to all ancestor parameters 
and data.

[Stackblitz demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar%2Ffoo-bar.component.ts)

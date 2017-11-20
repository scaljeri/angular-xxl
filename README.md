This library provides three decorators: **@RouteData**, **@RouteParams** and **@RouteQueryParams**. They extract the resolved
data, route parameters and query parameters values respectively using the `ActivatedRoute`. 

The decorators require that the `ActivatedRoute` is injected in the component's constructor as `route` and
that the component has the `ngOnInit` function defined. 

[![CircleCI](https://circleci.com/gh/scaljeri/angular-route-xxl.svg?style=svg)](https://circleci.com/gh/scaljeri/angular-route-xxl)
[![Coverage Status](https://coveralls.io/repos/github/scaljeri/angular-route-xxl/badge.svg?branch=multiple-values)](https://coveralls.io/github/scaljeri/angular-route-xxl?branch=multiple-values)
[![GitHub issues](https://img.shields.io/github/issues/scaljeri/angular-route-xxl.svg?style=plastic)](https://github.com/scaljeri/angular-route-xxl/issues)

[Stackblitz demo](https://stackblitz.com/edit/angular-dtexzt)

### Without @RouteData / @RouteParams / @RouteQueryParams

```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
    contacts$: Observable<Contact[]>;
    contactId$: Observable<string>;
    search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit() {
        this.contacts$ = this.route.parent.parent.parent.parent.data.map(data => data['contacts']);
        this.contactId$ = this.route.parent.parent.parent.params.map(params => params['contactId']);
        this.search$ = this.route.parent.parent.parent.queryParams.map(queryParams => queryParams['search']);
    }
}
```

### With @RouteData / @RouteParams / @RouteQueryParams

```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
    @RouteData('contacts') contacts$: Observable<Contact[]>;
    @RouteParams('contactId') contactId$: Observable<string>;
    @RouteQueryParams('search') search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit(): void {} // Without this it will not work if AOT enabled
}
```

The argument for both decorators is optional only if the value is identical to the property name 
the decorator belongs to (ignoring the '$')

```typescript
@RouteData() contacts$: Observable<Contact[]>;
@RouteParams() contactId$: Observable<string>;
@RouteQueryParams() search$: Observable<string>;
```

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

### Contributors
   + @dirkluijk - Suggested to solve the issue using decorators
   + @superMDguy - Added `@RouteQueryParams()` and an option to return actual values instead of Observables

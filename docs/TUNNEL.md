## @Tunnel
This decorator allows you to setup communication between instances of the same components/class.

For example, consider the following sibling components

```html
   <app-foo></app-foo>
   <app-foo></app-foo>
```
 
If you want them to be able to communicate using `@Tunnel` do

```typescript
    @Component({ ... })
    export class FooComponent implements ngOnInit {
        @Tunnel() tunnel$;
        
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

Note: It is required that the component has the `ActivatedRoute` as `route` and `ngOnInit` implemented

This decorator is not limited to sibling communication only, it goes straight through all routes!
If you want to see this in action, go to the [demo](https://stackblitz.com/edit/angular-route-xxl?file=app%2Ffoo-bar%2Ffoo-bar.component.ts)
and click on a route. The ripple effect is just caused by this decorator!

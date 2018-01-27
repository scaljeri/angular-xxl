## @Tunnel

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

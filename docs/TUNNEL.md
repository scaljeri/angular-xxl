## @Tunnel
This decorator allows you to communication between instances of the same components/class.

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

Note: It is required that the component has the `ngOnInit` implemented!

This decorator is not limited to sibling communication only, it goes straight through all routes!
If you want to see this in action, go to the [demo](https://stackblitz.com/edit/angular-tunnel?file=app%2Fblock%2Fblock.component.ts)



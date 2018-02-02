### @HostElement
This decorator monitors the size of html elements; the host element of a component or any of its children.
It is required that the component using this decorator implements the `OnInit` and `OnDestroy` interface

```typescript
@HostElement('height') height$: Observable<number>;
@HostElement('height', width, { selector: '.content'}) contentSize$: Observable<number>;
```

These provide an Observable, but if you are only interested in real values

```typescript
@HostElement('height', { observable: false}) height: number;
@HostElement('height', width, { observable: false, selector: '.content'}) contentSize: number;
```

You can also define rxjs [pipeable](https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md)
operator, to manipulate or filter out certain values

```typescript
@HostElement('height', { observable: false, pipe: [map(myMap), filter(myFilter)]}) height: number;
```

Finally, this decorator used the `not-very-well-supported` `Resizebserver`, so you need a polyfill. Add the 
following lines to your `polyfill.ts` file

```typescript
import ResizeObserver from 'resize-observer-polyfill';

declare global {
  interface Window { ResizeObserver: any; }
}

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}
```

and make sure to install the npm module

   $> yarn add resize-observer-polyfill


You can see all this in action in [this demo](https://stackblitz.com/edit/host-element)



Example:

```typescript
@Component({
  selector: 'app-normal',
  templateUrl: './normal.component.html',
  styleUrls: ['./normal.component.scss']
})
export class NormalComponent implements OnInit, OnDestroy {
  @HostElement('width') w: number$;
  @HostElement('height', {observable: false}) h: number;
  @HostElement() width: number;
  @HostElement('width', 'height', { pipe: [map(mapToPxFactory('width', 'height'))] }) pxSize: {width: string, height: string};
  @HostElement('width', {selector: '.inner'}) innerWidth: number;

  constructor(private element: ElementRef) { }

  ngOnInit() {} // Needed to initialize the decorator

  ngOnDestroy(): void {} // Needed to cleanup
}
```

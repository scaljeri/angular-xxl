import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';

export interface HostElementConfig {
    pipe?: any[];
    selector?: string;
    observable?: boolean;
}

export function HostElement(...args: Array<string | HostElementConfig>): PropertyDecorator {
    const config = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as HostElementConfig,

        return function factory(proto: { ngOnInit(): void, ngOnDestroy }, key: any): void {
        const ngOnInit = proto.ngOnInit;
        const ngOnDestroy = proto.ngOnDestroy;
        let observer: ResizeObserver;

        const property = args.shift() as string || key;

        proto.ngOnInit = function (): void {
            const target = config.selector ? this.element.nativeElement.querySelector(config.selector) : this.element.nativeElement;
            const updates = new BehaviorSubject<ResizeObserverEntry[]>([]);

            setTimeout(() => {
                observer = new ResizeObserver((entries: ResizeObserverEntry[]) => updates.next(entries));
                observer.observe(target);
            });

            const updates$: Observable<number> = updates.pipe(
                map((entries: ResizeObserverEntry[]) => {
                    return entries.length ? parseFloat(entries[0].contentRect[property]) : null;
                })
            );

            if (config.observable) {
                this[key] = updates$;
            } else {
                updates$.subscribe((value: number) => {
                    this[key] = value;
                });
            }

            ngOnInit.call(this);
        };

        proto.ngOnDestroy = function (): void {
            observer.disconnect();
            ngOnDestroy.call(this);
        }
    };
}

import {BehaviorSubject, Observable} from "rxjs";
import {filter, map} from "rxjs/operators";

declare global {
    interface Window {
        ResizeObserver: any;
    }
}

export interface ResizeObserver {
    observe(target: HTMLElement): void;

    disconnect(): void;
}

interface Proto {
    ngOnInit(): void;

    ngOnDestroy(): void;
}

interface ResizeObserverEntry {
    contentRect: { width: number, height: number };
}

export interface HostElementConfig {
    pipe?: any[];
    selector?: string;
    observable?: boolean;
}

export function HostElement(...args: Array<string | HostElementConfig>): PropertyDecorator {
    const config = (typeof args[args.length - 1] === "object" ? args.pop() : {}) as HostElementConfig;

    return function factory(proto: Proto, key: string): void {
        const ngOnInit = proto.ngOnInit;
        const ngOnDestroy = proto.ngOnDestroy;
        let observer: ResizeObserver;

        const properties = (args.length > 0 ? args : [key.replace(/\$$/, "")]) as string[];
        proto.ngOnInit = function(): void {
            const target = config.selector ?
                this.element.nativeElement.querySelector(config.selector) : this.element.nativeElement;
            const updates = new BehaviorSubject<any>((args.length > 1 ? {} : null));

            setTimeout(() => {
                observer = new window.ResizeObserver((entries: ResizeObserverEntry[]) => updates.next(entries));
                observer.observe(target);
            });

            const pipes = [
                filter(entries => !!entries),
                map((entries: ResizeObserverEntry[]) => {
                    return entries.length ? entries[0].contentRect : (properties.length > 1 ? {} : null);
                }),
                filter(value => value !== null),
                map(contentRect => { // extract values
                    return properties.reduce((list, arg: string) => {
                        list[arg] = contentRect[arg];

                        return properties.length > 1 ? list : list[arg];
                    }, {});
                }),
                ...(config.pipe || [])
            ];

            const updates$: Observable<any> = updates.pipe.apply(updates, pipes);

            if (config.observable === false) {
                if (properties.length > 1) {
                    this[key] = {};
                }

                updates$.subscribe(value => {
                    this[key] = value;
                });
            } else {
                this[key] = updates$;
            }

            ngOnInit.call(this);
        };

        proto.ngOnDestroy = function(): void {
            observer.disconnect();
            ngOnDestroy.call(this);
        };
    };
}

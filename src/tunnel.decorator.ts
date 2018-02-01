import { Subject } from 'rxjs/Subject';

const stream = new Subject<any>();

export function Tunnel(): PropertyDecorator {
    return (prototype: { ngOnInit(): void }, key: string): void => {
        const ngOnInit = prototype.ngOnInit,
            tunnel = {
                emit: (obj: any) => {
                    stream.next(obj);
                },
                stream$: stream.asObservable(),
            };

        prototype.ngOnInit = function(): void {
            this[key] = tunnel;

            ngOnInit.call(this);
        };
    };
}

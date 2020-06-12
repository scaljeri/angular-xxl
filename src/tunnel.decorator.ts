import {Subject} from 'rxjs';
import { replaceNgOnInit } from './replace-ng-oninit';

const stream = new Subject<any>();

export function Tunnel(): PropertyDecorator {
    return (prototype: { ngOnInit(): void }, key: string): void => {
        const tunnel = {
            emit: (obj: any) => {
                stream.next(obj);
            },
            stream$: stream.asObservable(),
        };

        replaceNgOnInit(prototype, function(): void {
            this[key] = tunnel;
        });
    };
}

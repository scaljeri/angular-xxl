import * as sinon from 'sinon';

import * as helper from './helpers';
import { Bar, Foo } from './helpers';

export function specs(RouteQueryParams, should) {
    describe('Route Pipes', () => {
        let foos: Foo[],
            bars: Bar[],
            spyFoo, spyBar, route, subjects;

        let qp;

        beforeEach(() => {
            helper.setup();
        });

        describe('As observable', () => {
            beforeEach(() => {
                RouteQueryParams('foa', { map: x => x * 2, filter: x => x !== 5 })(Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob', { map: x => x * 2, filter: x => x !== 5 })(Foo.prototype, 'ab$', 0);
                RouteQueryParams({ map: x => x * 2, filter: x => x !== 5 })(Foo.prototype, 'foc$', 0);

                ({ foos, bars, route, subjects } = helper.build());
                qp = helper.enableQueryParams(route);

                foos.forEach(foo => foo.ngOnInit());
            });

            it('should run map function', () => {
                qp.next({ foc: 7 });

                foos.forEach(foo => {
                    foo.foc$.subscribe(value => {
                        value.should.equal(7 * 2);
                    });
                });
            });

            it('should filter out items that fail filter', () => {
                qp.next({ foc: 5 });

                foos.forEach(foo => {
                    foo.foc$.subscribe(value => {
                        value.should.equal(7 * 2);
                    });
                });
            });
        });

        describe('As string', () => {
            beforeEach(() => {
                RouteQueryParams('foa', { observable: false, map: x => x * 2, filter: x => x !== 5 })(Foo.prototype, 'a', 0);
                RouteQueryParams('foa', 'fob', { observable: false, map: x => x * 2, filter: x => x !== 5 })(Foo.prototype, 'ab', 0);
                RouteQueryParams({ observable: false, map: x => x * 2, filter: x => x !== 5 })(Foo.prototype, 'foc', 0);

                ({ foos, bars, route, subjects } = helper.build());
                qp = helper.enableQueryParams(route);

                foos.forEach(foo => foo.ngOnInit());
            });

            it('should run map function', () => {
                qp.next({ foc: 7 });

                foos.forEach(foo => {
                    foo.foc.should.equal(7 * 2);
                });
            });

            it('should filter out items that fail filter', () => {
                qp.next({ foc: 5 });

                foos.forEach(foo => {
                    foo.foc.should.equal(7 * 2);
                });
            });
        });

    });
}

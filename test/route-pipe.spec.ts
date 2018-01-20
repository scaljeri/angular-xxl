import * as helper from './helpers';
import { filter, map } from 'rxjs/operators';
import { Foo } from './helpers';
import { Bar } from './helpers';

function doubleVal(input) {
    return input * 2;
}

function skipVal(input) {
    return !isNaN(input) && input !== 6;
}


function skipMultiVal(input) {
    return !!input && input.foa + input.fob !== 10;
}

export function specs(RouteQueryParams, should) {
    describe('Route Pipes', () => {
        let foos: Foo[], bars: Bar[], route, subjects, qp;

        beforeEach(() => {
            helper.setup();
        });

        describe('As observable', () => {
            beforeEach(() => {
                RouteQueryParams('foa', {pipe: [map(doubleVal), filter(skipVal)]})(helper.Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob', {pipe: [filter(skipMultiVal)]})(Foo.prototype, 'ab$', 0);
                RouteQueryParams({pipe: [filter(skipVal), map(doubleVal)]})(Foo.prototype, 'foc$', 0);

                ({foos, bars, route, subjects} = helper.build());
                qp = helper.enableQueryParams(route);

                foos.forEach(foo => foo.ngOnInit());
            });

            it('should use the lettables', () => {
                qp.next({foa: 7});

                foos.forEach(foo => {
                    foo.a$.subscribe(value => {
                        value.should.equal(doubleVal(7));
                    });
                });
            });

            it('should have scoped the lettables for multiple values', () => {
                qp.next({foa: 5, fob: 6});

                foos.forEach(foo => {
                    foo.ab$.subscribe(value => {
                        value.should.eql({foa: 5, fob: 6});
                    });
                });

                qp.next({foa: 5, fob: 5}); // should be filtered out
            });

            it('should keep the order of lettables', () => {
                qp.next({foc: 7});

                foos.forEach(foo => {
                    foo.foc$.subscribe(value => {
                        value.should.equal(doubleVal(7));
                    });
                });

                qp.next({foc: 6}); // should be filtered out
            });

            it('should ignore a value', () => {
                foos.forEach(foo => {
                    foo.a$.subscribe(value => {
                        value.should.equal(doubleVal(8));
                    });
                });

                qp.next({foa: 3}); // should be filter out
                qp.next({foa: 8}); // should pass
            });
        });

        describe('As string', () => {
            beforeEach(() => {
                RouteQueryParams('foa',
                    {observable: false, pipe: [map(doubleVal), filter(skipVal)]})(helper.Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob',
                    {observable: false, pipe: [filter(skipMultiVal)]})(Foo.prototype, 'ab$', 0);
                RouteQueryParams({
                    observable: false,
                    pipe: [filter(skipVal), map(doubleVal)]
                })(Foo.prototype, 'foc$', 0);

                ({foos, bars, route, subjects} = helper.build());
                qp = helper.enableQueryParams(route);

                foos.forEach(foo => foo.ngOnInit());
                qp.next({foa: 0});//, fob: 0, foc: 0});
            });

            it('should use the lettables', () => {
                qp.next({foa: 7});

                foos.forEach(foo => {
                    foo.a$.should.equal(doubleVal(7));
                });
            });

            it('should have scoped the lettables for multiple values', () => {
                qp.next({foa: 5, fob: 6}); // should be filter out

                foos.forEach(foo => {
                    foo.ab$.should.eql({foa: 5, fob: 6});
                });
            });

            it('should filter out specific values', () => {
                qp.next({foa: 5, fob: 5}); // should be filtered out


                foos.forEach(foo => {
                    foo.ab$.should.eql({});
                });
            });

            it('should keep the order of lettables', () => {
                qp.next({foc: 7});

                foos.forEach(foo => {
                    foo.foc$.should.equal(doubleVal(7));
                });
            });
        });
    })
}

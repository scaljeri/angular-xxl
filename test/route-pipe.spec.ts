import * as helper from './helpers';
import { filter, map } from 'rxjs/operators';
import { Foo } from './helpers';
import { Bar } from './helpers';

function doubleVal(input): number {
    return input * 2;
}

function skipVal(input): boolean {
    return !isNaN(input) && input !== 6;
}

function skipMultiVal(input): boolean {
    return !!input && input.foa + input.fob !== 10;
}

export function specs(RouteQueryParams, should) {
    describe('Route Pipes', () => {
        let foos: Foo[];

        describe('As observable', () => {
            beforeEach(() => {
                RouteQueryParams('foa', {pipe: [map(doubleVal), filter(skipVal)]})(helper.Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob', {pipe: [filter(skipMultiVal)]})(Foo.prototype, 'ab$', 0);
                RouteQueryParams({pipe: [filter(skipVal), map(doubleVal)]})(Foo.prototype, 'foc$', 0);

                foos = helper.build();
                helper.enableQueryParams();

                foos.forEach(foo => foo.ngOnInit());
            });

            it('should use the lettables', (done) => {
                helper.updateRoute(2, {foa: 7});

                foos.forEach((foo, i) => {
                    foo.a$.subscribe(value => {
                        value.should.equal(doubleVal(7));
                        i === 2 && done();
                    });
                });
            });

            it('should have scoped the lettables for multiple values', (done) => {
                helper.updateRoute(2, {foa: 5, fob: 6});

                foos.forEach((foo, i) => {
                    foo.ab$.subscribe(value => {
                        value.should.eql({foa: 5, fob: 6});
                        i === 2 && done();
                    });
                });

                helper.updateRoute(2, {foa: 5, fob: 5}); // should be filtered out
            });

            it('should keep the order of lettables', (done) => {
                helper.updateRoute(2, {foc: 7});

                foos.forEach((foo, i) => {
                    foo.foc$.subscribe(value => {
                        value.should.equal(doubleVal(7));
                        i === 2 && done();
                    });
                });

                helper.updateRoute(2, {foc: 6}); // should be filtered out
            });

            it('should ignore a value', (done) => {
                foos.forEach((foo, i) => {
                    foo.a$.subscribe(value => {
                        value.should.equal(doubleVal(8));
                        i === 2 && done();
                    });
                });

                helper.updateRoute(2, {foa: 3}); // should be filter out
                helper.updateRoute(2, {foa: 8}); // should pass
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
                    pipe: [filter(skipVal), map(doubleVal)],
                })(Foo.prototype, 'foc$', 0);

                foos = helper.build();
                helper.enableQueryParams();

                foos.forEach(foo => foo.ngOnInit());
                helper.updateRoute(2, {foa: 0}); //, fob: 0, foc: 0});
            });

            it('should use the lettables', (done) => {
                helper.updateRoute(2, { foa: 7 });

                foos.forEach((foo, i) => {
                    foo.a$.should.equal(doubleVal(7));
                    i === 2 && done();
                });
            });

            it('should have scoped the lettables for multiple values', (done) => {
                helper.updateRoute(2, { foa: 5, fob: 6 }); // should be filter out

                foos.forEach((foo, i) => {
                    foo.ab$.should.eql({foa: 5, fob: 6});
                    i === 2 && done();
                });
            });

            it('should filter out specific values', () => {
                helper.updateRoute(2, {foa: 5, fob: 5}); // should be filtered out

                foos.forEach(foo => {
                    foo.ab$.should.eql({});
                });
            });

            it('should keep the order of lettables', () => {
                helper.updateRoute(2, {foc: 7});

                foos.forEach(foo => {
                    foo.foc$.should.equal(doubleVal(7));
                });
            });
        });
    })
}

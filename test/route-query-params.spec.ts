import * as sinon from 'sinon';
import { build, enableQueryParams, Foo, updateRoute } from './helpers';

export function specs(RouteQueryParams, should) {
    describe('RouteQueryParams', () => {
        let foos: Foo[], spyFoo;

        beforeEach(() => {
            spyFoo = Foo.prototype.ngOnInit = sinon.spy();
        });

        it('should exist', () => {
            should.exist(RouteQueryParams);
        });

        describe('Without ngOnInit', () => {
            beforeEach(() => {
                delete Foo.prototype.ngOnInit;
            });

            it('should throw an missing route error', () => {
                (function() {
                    RouteQueryParams('foa')(Foo.prototype, 'a$', 0);
                }).should.throw(`Foo uses the queryParams @decorator without implementing 'ngOnInit'`);
            });
        });

        describe('As observables', () => {
            beforeEach(() => {
                RouteQueryParams('foa')(Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob')(Foo.prototype, 'ab$', 0);
                RouteQueryParams()(Foo.prototype, 'foc$', 0);

                foos = build();
                enableQueryParams();

                foos.forEach(foo => foo.ngOnInit());
            });

            describe('Implicit value', () => {
                beforeEach(() => {
                    updateRoute(2, {foc: 7});
                });

                it('should have a value', (done) => {
                    foos.forEach((foo, i) => {
                        foo.foc$.subscribe(value => {
                            value.should.equal(7);
                            i === 2 && done();
                        });
                    });
                });
            });

            describe('Single value', () => {
                beforeEach(() => {
                    updateRoute(2, {foa: 8});
                });

                it('should have a value', (done) => {
                    foos.forEach((foo, i) => {
                        foo.a$.subscribe(value => {
                            value.should.equal(8);
                        });

                        foo.ab$.subscribe(value => {
                            value.should.eql({foa: 8});
                            i === 2 && done();
                        });
                    });
                });
            });

            describe('Multi value', () => {
                beforeEach(() => {
                    updateRoute(2, {foa: 8, fob: 9});
                });

                it('should have a value', (done) => {
                    foos.forEach((foo, i) => {
                        foo.a$.subscribe(value => {
                            value.should.equal(8);
                        });

                        foo.ab$.subscribe(value => {
                            value.should.eql({foa: 8, fob: 9});
                            i === 2 && done();
                        });
                    });
                });
            });
        });

        describe('As string', () => {
            beforeEach(() => {
                RouteQueryParams('foa', {observable: false})(Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob', {observable: false})(Foo.prototype, 'ab$', 0);
                RouteQueryParams({observable: false})(Foo.prototype, 'foc$', 0);

                foos = build();
                enableQueryParams();

                foos.forEach(foo => foo.ngOnInit());
            });

            describe('Implicit value', () => {
                beforeEach(() => {
                    updateRoute(2, {foc: 7});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.foc$.should.equal(7);
                    });
                });
            });
            describe('Single value', () => {
                beforeEach(() => {
                    updateRoute(2, {foa: 8});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.a$.should.equal(8);

                        foo.ab$.should.eql({foa: 8});
                    });
                });
            });

            describe('Multi value', () => {
                beforeEach(() => {
                    updateRoute(2, {foa: 8, fob: 9});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.a$.should.equal(8);

                        foo.ab$.should.eql({foa: 8, fob: 9});
                    });
                });
            });
        });

        after(() => {
            Foo.prototype.ngOnInit = function(): void {};
        });
    });
}

import { Bar, Foo, setup, build, enableQueryParams } from './helpers';

export function specs(RouteQueryParams, should) {
    describe('RouteQueryParams', () => {
        let foos: Foo[],
            bars: Bar[],
            spyFoo, spyBar, route, subjects;

        let qp;

        beforeEach(() => {
            setup();
            [spyFoo, spyBar] = [Foo.prototype.ngOnInit, Bar.prototype.ngOnInit];
        });

        it('should exist', () => {
            should.exist(RouteQueryParams);
        });

        describe('Without ngOnInit', () => {
            beforeEach(() => {
                delete Foo.prototype.ngOnInit;
            });

            it('should throw an missing route error', () => {
                (function () {
                    RouteQueryParams('foa')(Foo.prototype, 'a$', 0);
                }).should.throw(`Foo uses the queryParams @decorator without implementing 'ngOnInit'`);
            });
        });

        describe('As observables', () => {
            beforeEach(() => {
                RouteQueryParams('foa')(Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob')(Foo.prototype, 'ab$', 0);
                RouteQueryParams()(Foo.prototype, 'foc$', 0);

                ({foos, bars, route, subjects} = build());
                qp = enableQueryParams(route);

                foos.forEach(foo => foo.ngOnInit());
            });

            describe('Implicit value', () => {
                beforeEach(() => {
                    qp.next({foc: 7});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.foc$.subscribe(value => {
                            value.should.equal(7);
                        })
                    })
                });
            });
            describe('Single value', () => {
                beforeEach(() => {
                    qp.next({foa: 8});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.a$.subscribe(value => {
                            value.should.equal(8);
                        });

                        foo.ab$.subscribe(value => {
                            value.should.eql({foa: 8});
                        });
                    })
                });
            });
            describe('Multi value', () => {
                beforeEach(() => {
                    qp.next({foa: 8, fob: 9});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.a$.subscribe(value => {
                            value.should.equal(8);
                        });

                        foo.ab$.subscribe(value => {
                            value.should.eql({foa: 8, fob: 9});
                        });
                    })
                });
            });
        });

        describe('As string', () => {
            beforeEach(() => {
                RouteQueryParams('foa', {observable: false})(Foo.prototype, 'a$', 0);
                RouteQueryParams('foa', 'fob', {observable: false})(Foo.prototype, 'ab$', 0);
                RouteQueryParams({observable: false})(Foo.prototype, 'foc$', 0);

                ({foos, bars, route, subjects} = build());
                qp = enableQueryParams(route);

                foos.forEach(foo => foo.ngOnInit());
            });

            describe('Implicit value', () => {
                beforeEach(() => {
                    qp.next({foc: 7});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.foc$.should.equal(7);
                    });
                });
            });
            describe('Single value', () => {
                beforeEach(() => {
                    qp.next({foa: 8});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.a$.should.equal(8);

                        foo.ab$.should.eql({foa: 8});
                    })
                });
            });

            describe('Multi value', () => {
                beforeEach(() => {
                    qp.next({foa: 8, fob: 9});
                });

                it('should have a value', () => {
                    foos.forEach(foo => {
                        foo.a$.should.equal(8);

                        foo.ab$.should.eql({foa: 8, fob: 9});
                    })
                });
            });
        });
    });
}

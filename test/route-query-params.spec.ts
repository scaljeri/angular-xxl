import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';

export function specs(RouteQueryParams, should) {
    describe('RouteQueryParams', () => {
        let comp, subject, route;

        beforeEach(() => {
            subject = new BehaviorSubject(null);


            route = {
                queryParams: subject.asObservable(),
                parent: {
                    queryParams: of({foo: 2}),
                }
            };

            comp = {route};
        });

        it('should exist', () => {
            RouteQueryParams.should.exist;
        });

        describe('As observable', () => {
            describe('Implicit value', () => {
                beforeEach(() => {
                    RouteQueryParams()(comp, 'foo$');
                });

                it('should not have created the property', () => {
                    should.not.exist(comp.foo$);
                });

                describe('After ngOnInit', () => {
                    beforeEach(() => {
                        comp.ngOnInit();
                    });

                    it('should initially be empty', () => {
                        comp.foo$.subscribe(qp => should.not.exist(qp));
                    });

                    it('should update with a new query param', () => {
                        subject.next({foo: 1});

                        comp.foo$.subscribe(qp => qp.should.eql(1));
                    });
                });
            });

            describe('Single value', () => {
                beforeEach(() => {
                    RouteQueryParams('foo')(comp, 'queryParams$');
                });


                it('should have created ngOnInit', () => {
                    should.exist(comp.ngOnInit);
                });

                it('should not have created the property', () => {
                    should.not.exist(comp.queryParams$);
                });

                describe('After ngOnInit', () => {
                    beforeEach(() => {
                        comp.ngOnInit();
                    });

                    it('should initially be empty', () => {
                        comp.queryParams$.subscribe(qp => {
                            should.not.exist(qp);
                        });
                    });

                    it('should update with a new query param', () => {
                        subject.next({foo: 1});

                        comp.queryParams$.subscribe(qp => {
                            qp.should.eql(1);
                        });
                    });
                });
            });

            describe('Multi value', () => {
                beforeEach(() => {
                    RouteQueryParams('bar', 'foo')(comp, 'queryParams$');
                });

                describe('After ngOnInit', () => {
                    beforeEach(() => {
                        comp.ngOnInit();
                    });

                    it('should have created an empty object', () => {
                        comp.queryParams$.subscribe(qp => qp.should.eql({}));
                    });

                    it('should update with a new query params', () => {
                        subject.next({bar: 1, foo: 2});

                        comp.queryParams$.subscribe(qp => {
                            qp.should.eql({bar: 1, foo: 2});
                        });
                    });
                });
            });
        });

        describe('As string', () => {
            describe('Implicit value', () => {
                beforeEach(() => {
                    RouteQueryParams({observable: false})(comp, 'foo');
                });

                it('should not have created the property', () => {
                    should.not.exist(comp.foo);
                });

                describe('After ngOnInit', () => {
                    beforeEach(() => {
                        comp.ngOnInit();
                    });

                    it('should initially be empty', () => {
                        should.not.exist(comp.foo);
                    });

                    it('should update with a new query param', () => {
                        subject.next({foo: 1});

                        comp.foo.should.eql(1);
                    });
                });
            });

            describe('Single value', () => {
                beforeEach(() => {
                    RouteQueryParams('foo', {observable: false})(comp, 'foo');
                });

                it('should not have created the property', () => {
                    should.not.exist(comp.foo);
                });

                describe('After ngOnInit', () => {
                    beforeEach(() => {
                        comp.ngOnInit();
                    });

                    it('should initially be empty', () => {
                        should.not.exist(comp.foo);
                    });

                    it('should update with a new query param', () => {
                        subject.next({foo: 1});

                        comp.foo.should.eql(1);
                    });
                });
            });

            describe('Multi value', () => {
                beforeEach(() => {
                    RouteQueryParams('bar', 'foo', {observable: false})(comp, 'queryParams');
                });

                describe('After ngOnInit', () => {
                    beforeEach(() => {
                        comp.ngOnInit();
                    });

                    it('should have created an empty object', () => {
                        comp.queryParams.should.eql({});
                    });

                    it('should update with a new query params', () => {
                        subject.next({bar: 1, foo: 2});

                        comp.queryParams.should.eql({bar: 1, foo: 2});
                    });
                });
            });
        });
    });
}

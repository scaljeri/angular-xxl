import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as sinon from 'sinon';

export function specs(RouteData, property, should) {
    describe('RouteData', () => {
        const bar = {}, fb = {foo: 'foo', baz: 'baz'}, moz = {};

        let comp, spy, route, subjects;

        beforeEach(() => {
            subjects = [new BehaviorSubject(null), new BehaviorSubject(null), new BehaviorSubject(null)];

            route = {
                [property]: subjects[0].asObservable(),
                parent: {
                    [property]: subjects[1].asObservable(),
                    parent: {
                        [property]: subjects[2].asObservable(),
                    }
                }
            };

            spy = sinon.spy();
            comp = {route: route, ngOnInit: spy};
        });

        it('should exist', () => {
            should.exist(RouteData);
        });

        describe('As observables', () => {
            beforeEach(() => {
                RouteData('bar')(comp, 'bar$', 0);
                RouteData('foo', 'baz')(comp, 'fb$', 0);
                RouteData()(comp, 'moz$', 0);

                comp.ngOnInit();
            });

            it('should have bind all observables', () => {
                comp.bar$.should.be.instanceOf(Observable);
                comp.fb$.should.be.instanceOf(Observable);
                comp.moz$.should.be.instanceOf(Observable);
            });

            it('should have called ngOnInit', () => {
                spy.should.have.been.called;
            });

            it('should have restored ngOnInit', () => {
                comp.ngOnInit.should.equals(spy);
            });

            describe('Root route only', () => {
                beforeEach(() => {
                    subjects[0].next({bar});
                });

                describe('Propagate updates', () => {
                    it('should update the named decorator', () => {
                        comp.bar$.subscribe(data => {
                            data.should.equals(bar)
                        });
                    });

                    it('should have no interference with other route updates', () => {
                        subjects[1].next({moz});

                        comp.bar$.subscribe(data => data.should.equals(bar));
                    });

                    it('should update the multi-named decorator', () => {
                        subjects[0].next(fb);

                        comp.fb$.subscribe(data => data.should.eql(fb));
                    });

                    it('should update the implicit decorator', () => {
                        subjects[0].next({moz});

                        comp.moz$.subscribe(data => data.should.equals(moz));
                    });
                });
            });

            describe('Nested Routes', () => {
                beforeEach(() => {
                    subjects[0].next({bar});
                    subjects[1].next(fb);
                    subjects[2].next({moz});
                });

                describe('Propagate updates', () => {
                    it('should update the named decorator', () => {
                        comp.bar$.subscribe(data => data.should.equals(bar));
                    });

                    it('should update the multi-named decorator', () => {
                        comp.fb$.subscribe(data => data.should.eql(fb));
                    });

                    it('should update the implicit decorator', () => {
                        comp.moz$.subscribe(data => data.should.equals(moz));
                    });
                });
            });
        });
        describe('As strings', () => {
            beforeEach(() => {
                RouteData('bar', {observable: false})(comp, 'bar', 0);
                RouteData('foo', 'baz', {observable: false})(comp, 'fb', 0);
                RouteData({observable: false})(comp, 'moz', 0);

                comp.ngOnInit();
            });

            it('should have called ngOnInit', () => {
                spy.should.have.been.called;
            });

            it('should have restored ngOnInit', () => {
                comp.ngOnInit.should.equals(spy);
            });

            it('should not have set values for single-value decorators', () => {
                should.not.exist(comp.bar);
                should.not.exist(comp.moz);
            });

            it('should have set an empty object for the multi-value decorators', () => {
                comp.fb.should.eql({});
            });

            describe('Root route only', () => {
                beforeEach(() => {
                    subjects[0].next({bar});
                });

                describe('Propagate updates', () => {
                    it('should update the named decorator', () => {
                        comp.bar.should.equals(bar);
                    });

                    it('should have no interference with other route updates', () => {
                        subjects[1].next({moz});

                        comp.bar.should.equals(bar);
                    });

                    it('should update the multi-named decorator', () => {
                        subjects[0].next(fb);

                        comp.fb.should.eql(fb);
                    });

                    it('should update the implicit decorator', () => {
                        subjects[0].next({moz});

                        comp.moz.should.equals(moz);
                    });
                });
            });

            describe('Nested Routes', () => {
                beforeEach(() => {
                    subjects[0].next({bar});
                    subjects[1].next(fb);
                    subjects[2].next({moz});
                });

                describe('Propagate updates', () => {
                    it('should update the named decorator', () => {
                        comp.bar.should.equals(bar);
                    });

                    it('should update the multi-named decorator', () => {
                        comp.fb.should.eql(fb);
                    });

                    it('should update the implicit decorator', () => {
                        comp.moz.should.equals(moz);
                    });
                });
            });
        });

        describe('As strings', () => {
            beforeEach(() => {
                RouteData('bar', {observable: false})(comp, 'bar$', 0);
                RouteData('foo', 'moz', {observable: false})(comp, 'foo$', 0);
                RouteData({observable: false})(comp, 'baz$', 0);

                comp.ngOnInit();
            });

            it('should not have a value set yet', () => {
                should.not.exist(comp.contacts);
            });
        });

        describe('With ngOnInit-less component', () => {
            beforeEach(() => {
                delete comp.ngOnInit;

                RouteData('bar', {observable: false})(comp, 'bar');
            });

            it('should have a temp ngOnInit function', () => {
                should.exist(comp.ngOnInit);
            });

            it('should be removed after init', () => {
                comp.ngOnInit();

                should.not.exist(comp.ngOnInit);
            });
        });

        describe('Missing ActivatedRoute', () => {
            beforeEach(() => {
                delete comp.route;
                comp.constructor = {name: 'BarFoo'};

                RouteData('bar', {observable: false})(comp, 'bar');
            });

            it('should throw an missing route error', () => {
                (function () {
                    comp.ngOnInit();
                }).should.throw(`BarFoo uses the ${property} @decorator without a \'route\' property`);
            });
        });
    });
}

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as sinon from 'sinon';

import * as helper from './helpers';

export function specs(RouteData, property, should) {
    describe('RouteData', () => {
        const bar = {}, fb = {foo: 'foo', baz: 'baz'}, moz = {};

        let instances, Comp, comp, spy, route, subjects;

        beforeEach(() => {
            ({instances, Comp, route, spy} = helper.setup(property));

            /*
            Comp.prototype.ngOnInit = spy;

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
            */

            comp = instances[0];
        });

        it('should exist', () => {
            should.exist(RouteData);
        });

        describe('As observables', () => {
            beforeEach(() => {
                RouteData('bar')(Comp.prototype, 'bar$', 0);
                RouteData('foo', 'baz')(Comp.prototype, 'fb$', 0);
                RouteData()(Comp.prototype, 'moz$', 0);

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
                    helper.updateRoute(0, {bar});
                });

                describe('Propagate updates', () => {
                    it('should update the named decorator', () => {
                        comp.bar$.subscribe(data => {
                            console.log(data,bar);
                            data.should.equals(bar)
                        });
                    });

                    it('should have no interference with other route updates', () => {
                        helper.updateRoute(1, {moz});

                        comp.bar$.subscribe(data => data.should.equals(bar));
                    });

                    it('should update the multi-named decorator', () => {
                        helper.updateRoute(0, fb);

                        comp.fb$.subscribe(data => data.should.eql(fb));
                    });

                    it('should update the implicit decorator', () => {
                        helper.updateRoute(0, {moz});

                        comp.moz$.subscribe(data => data.should.equals(moz));
                    });
                });
            });

            describe('Nested Routes', () => {
                beforeEach(() => {
                    helper.updateRoute(0, {bar});
                    helper.updateRoute(1, fb);
                    helper.updateRoute(2, {moz});
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
                RouteData('bar', {observable: false})(Comp.prototype, 'bar', 0);
                RouteData('foo', 'baz', {observable: false})(Comp.prototype, 'fb', 0);
                RouteData({observable: false})(Comp.prototype, 'moz', 0);

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
                    helper.updateRoute(0, {bar});
                });

                describe('Propagate updates', () => {
                    it('should update the named decorator', () => {
                        comp.bar.should.equals(bar);
                    });

                    it('should have no interference with other route updates', () => {
                        helper.updateRoute(1, {moz});

                        comp.bar.should.equals(bar);
                    });

                    it('should update the multi-named decorator', () => {
                        helper.updateRoute(0, fb);

                        comp.fb.should.eql(fb);
                    });

                    it('should update the implicit decorator', () => {
                        helper.updateRoute(0, {moz});

                        comp.moz.should.equals(moz);
                    });
                });
            });

            describe('Nested Routes', () => {
                beforeEach(() => {
                    helper.updateRoute(0, {bar});
                    helper.updateRoute(1, fb);
                    helper.updateRoute(2, {moz});
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
                RouteData('bar', {observable: false})(Comp.prototype, 'bar$', 0);
                RouteData('foo', 'moz', {observable: false})(Comp.prototype, 'foo$', 0);
                RouteData({observable: false})(Comp.prototype, 'baz$', 0);

                comp.ngOnInit();
            });

            it('should not have a value set yet', () => {
                should.not.exist(comp.contacts);
            });
        });

        describe('With ngOnInit-less component', () => {
            beforeEach(() => {
                delete Comp.prototype.ngOnInit;
                comp = new Comp(route);
            });

            it('should throw an error', () => {
                (function () {
                    RouteData('bar', {observable: false})(Comp.prototype, 'bar');
                }).should.throw(`Comp uses the ${property} @decorator without implementing 'ngOnInit'`);
            });
        });

        describe('Missing ActivatedRoute', () => {
            beforeEach(() => {
                delete comp.route;
                comp.constructor = {name: 'BarFoo'};

                RouteData('bar', {observable: false})(comp, 'bar');
            });

            xit('should throw an missing route error', () => {
                (function () {
                    comp.ngOnInit();
                }).should.throw(`BarFoo uses the ${property} @decorator without a \'route\' property`);
            });
        });
    });
}

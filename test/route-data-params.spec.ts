import { Observable } from 'rxjs/Observable';
import * as sinon from 'sinon';

import * as helper from './helpers';
import { Bar, Foo } from './helpers';

export function specs(RouteXxl, property, should) {
    describe(property, () => {
        let foos: Foo[],
            bars: Bar[],
            spyFoo, spyBar, route, subjects;

        let spy;

        beforeEach(() => {
            helper.setup();
            [spyFoo, spyBar] = [Foo.prototype.ngOnInit, Bar.prototype.ngOnInit];
        });

        it('should exist', () => {
            should.exist(RouteXxl);
        });

        describe('As observables', () => {
            beforeEach(() => {
                RouteXxl('foa')(Foo.prototype, 'a$', 0);
                RouteXxl('foa', 'fob')(Foo.prototype, 'ab$', 0);
                RouteXxl()(Foo.prototype, 'foc$', 0);

                RouteXxl('baa')(Bar.prototype, 'a$', 0);
                RouteXxl('baa', 'bab')(Bar.prototype, 'ab$', 0);
                RouteXxl()(Bar.prototype, 'bac$', 0);

                ({foos, bars, route, subjects} = helper.build(property));

                foos.forEach(foo => foo.ngOnInit());
                bars.forEach(bar => bar.ngOnInit());
            });

            it('should have replaced ngOnInit', () => {
               foos[0].should.not.equal(spyFoo);
            });

            it('should have called called the spy for each instance', () => {
                spyFoo.should.have.callCount(3);
                spyBar.should.have.calledThrice;
            });

            it('should have replaced ngOnInit permanently', () => {
               Foo.prototype.ngOnInit.should.not.equal(spyFoo);
            });



            it('should have bind all observables', () => {
                for (let i = 0; i < 3; i++) {
                    foos[i].a$.should.be.instanceOf(Observable);
                    foos[i].ab$.should.be.instanceOf(Observable);
                    foos[i].foc$.should.be.instanceOf(Observable);

                    bars[i].a$.should.be.instanceOf(Observable);
                    bars[i].ab$.should.be.instanceOf(Observable);
                    bars[i].bac$.should.be.instanceOf(Observable);
                }
            });

            it('should have given each a unique observable', () => {
                foos[0].should.not.equal(foos[1]);
                foos[0].should.not.equal(bars[0]);
            });

            describe('Set route values', () => {
                const data = {id: 1};

                describe('Root', () => {
                    beforeEach(() => {
                        subjects[0].next({foa: data})
                    });

                    describe('Foo.a$', () => {
                        it('should send the data to the instances', () => {
                            spy = sinon.spy();
                            foos.forEach(foo => foo.a$.subscribe(spy));

                            // Foo receives the data
                            spy.should.have.calledThrice;
                            spy.should.have.been.calledWith(data);
                        });

                        it('should not send data to ab$', () => {
                            spy = sinon.spy();
                            foos.forEach(foo => foo.ab$.subscribe(spy));
                            spy.should.have.calledThrice;
                            spy.should.have.been.calledWith({foa: data});
                        });

                        it('should not send data to foc$', () => {
                            spy = sinon.spy();
                            foos.forEach(foo => foo.foc$.subscribe(spy));
                            spy.should.have.calledThrice;
                            spy.should.have.been.calledWith(undefined);
                        });

                        it('should not send the data to Bar instances', () => {
                            // Bar doesn't and only receives the initial `null` value
                            spy = sinon.spy();
                            bars.forEach(bar => bar.a$.subscribe(spy));
                            spy.should.have.been.calledWith(undefined);
                        });


                    });
                });

                describe('Root -> First child', () => {
                    beforeEach(() => {
                        subjects[1].next({foa: data})
                    });

                    describe('Foo.a$', () => {
                        it('should send the data to the right routes', () => {
                            spy = sinon.spy();
                            foos.filter((v, i) => i > 0)
                                .forEach(foo => foo.a$.subscribe(spy));

                            // Foo receives the data
                            spy.should.have.calledTwice;
                            spy.should.have.been.calledWith(data);
                        });

                        it('should skip the root', () => {
                            spy = sinon.spy();
                            foos[0].a$.subscribe(spy);
                            spy.should.have.calledOnce;
                            spy.should.have.been.calledWith(undefined);
                        });
                    });
                });

                describe('Root -> First child -> First child', () => {
                    beforeEach(() => {
                        subjects[1].next({foa: data})
                    });

                    describe('Foo.a$', () => {
                        it('should send the data to the right routes', () => {
                            spy = sinon.spy();
                            foos[2].a$.subscribe(spy);
                            spy.should.have.calledOnce;
                            spy.should.have.been.calledWith(data);

                        });

                        it('should skip the root', () => {
                            spy = sinon.spy();
                            foos.filter((v, i) => i < 2)
                                .forEach(foo => foo.a$.subscribe(spy));

                            // Foo receives the data
                            spy.should.have.calledTwice;
                            spy.should.have.been.calledWith(undefined);
                        });
                    });
                });
            });

            describe('Multi value route', () => {
                const data = {id: 2};

                describe('single value', () => {
                    beforeEach(() => {
                        subjects[0].next({foa: data})
                    });

                    it('should have set a value on ab$ of Foo', () => {
                        spy = sinon.spy();
                        foos[0].ab$.subscribe(spy);
                        spy.should.have.been.calledOnce;
                        spy.should.have.been.calledWith({foa: data});
                    });

                    it('should not have set a value on ab$ of Bar', () => {
                        spy = sinon.spy();
                        bars[0].ab$.subscribe(spy);
                        spy.should.have.been.calledOnce;
                        spy.should.have.been.calledWith({});
                    });
                });

                describe('multi value (single route)', () => {
                    const data1 = {id: 3};

                    beforeEach(() => {
                        subjects[0].next({baa: data, bab: data1});
                    });

                    it('should have set a value on ab$', () => {
                        spy = sinon.spy();
                        bars[1].ab$.subscribe(spy);
                        spy.should.have.been.calledOnce;
                        spy.should.have.been.calledWith({baa: data, bab: data1});
                    });

                    it('should not have set a value on ab$ of Bar', () => {
                        spy = sinon.spy();
                        foos[0].ab$.subscribe(spy);
                        spy.should.have.been.calledOnce;
                        spy.should.have.been.calledWith({});
                    });
                })
            });

            describe('Implicit value', () => {
                const data = {id: 4};

                beforeEach(() => {
                    subjects[1].next({foc: data});
                });

                it('should have set the value', () => {
                    spy = sinon.spy();
                    foos[1].foc$.subscribe(spy);
                    spy.should.have.been.calledOnce;
                    spy.should.have.been.calledWith(data);
                });
            });
        });

        describe('As strings', () => {
            beforeEach(() => {
                RouteXxl('foa', {observable: false})(Foo.prototype, 'a$', 0);
                RouteXxl('foa', 'fob', {observable: false})(Foo.prototype, 'ab$', 0);
                RouteXxl({observable: false})(Foo.prototype, 'foc', 0);

                RouteXxl('baa', {observable: false})(Bar.prototype, 'a$', 0);
                RouteXxl('baa', 'bab', {observable: false})(Bar.prototype, 'ab$', 0);
                RouteXxl({observable: false})(Bar.prototype, 'bac', 0);

                ({foos, bars, route, subjects} = helper.build(property));

                foos.forEach(foo => foo.ngOnInit());
                bars.forEach(bar => bar.ngOnInit());
            });

            describe('Implicit value route', () => {
                beforeEach(() => {
                    subjects[0].next({foc: 8});
                });

                it('should have set the value', () => {
                    foos[0].foc.should.equal(8);
                });
            });

            describe('Single value route', () => {
                beforeEach(() => {
                    subjects[0].next({foa: 8});
                });

                it('should have set the value', () => {
                    foos[0].a$.should.equal(8);
                });

                it('should have set one value on the multi object', () => {
                    foos[2].ab$.should.eql({foa: 8});
                });
            });

            describe('Multi value route', () => {
                beforeEach(() => {
                    subjects[0].next({foa: 8, fob: 9});
                });

                it('should have set the value', () => {
                    foos[0].ab$.should.eql({foa: 8, fob: 9});
                });
            });

            describe('Value propagation', () => {
                const data = {foa: 9};

                beforeEach(() => {
                    subjects[1].next(data);
                });

                it('should have set the value', () => {
                    foos[0].ab$.should.eql({});
                    foos[1].ab$.should.eql(data);
                    foos[2].ab$.should.eql(data);
                });
            });
        });

        describe('Inherit', () => {
            beforeEach(() => {
                RouteXxl('foa', {observable: false, inherit: true})(Foo.prototype, 'a$', 0);
                RouteXxl('foa', 'fob', {observable: false})(Foo.prototype, 'ab$', 0);
                RouteXxl({inherit: true})(Foo.prototype, 'foc', 0);

                ({foos, bars, route, subjects} = helper.build(property));

                foos.forEach(foo => foo.ngOnInit());
                bars.forEach(bar => bar.ngOnInit());
            });

            describe('As observable', () => {
                beforeEach(() => {
                    subjects[1].next({foa: 1, fob: 2, foc: 3});
                });

                it('should have globally set the values', () => {
                    foos.forEach(foo => {
                        foo.a$.should.equal(1);
                        spy = sinon.spy();
                        foo.foc.subscribe(spy);
                        spy.should.have.been.calledWith(3);
                    });

                    // Not globals
                    foos[0].ab$.should.eql({});
                    foos[1].ab$.should.eql({foa: 1, fob: 2});
                    foos[2].ab$.should.eql({foa: 1, fob: 2});

                });
            });
        });

        describe('Without ngOnInit', () => {
            beforeEach(() => {
                delete Foo.prototype.ngOnInit;
            });

            it('should throw an missing route error', () => {
                (function () {
                    RouteXxl('foa')(Foo.prototype, 'a$', 0);
                }).should.throw(`Foo uses the ${property} @decorator without implementing 'ngOnInit'`);
            });
        });

        describe('Without route', () => {
            beforeEach(() => {
                RouteXxl('foa')(Foo.prototype, 'a$', 0);
            });

            it('should throw an missing route error', () => {
                (function () {
                    new Foo(null).ngOnInit();
                }).should.throw(`Foo uses a route-xxl @decorator without a 'route: ActivatedRoute' property`);
            });
        });
    });
};


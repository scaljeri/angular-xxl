import { Observable } from 'rxjs';
import * as sinon from 'sinon';

import * as helper from './helpers';
import { Foo, updateRoute} from './helpers';

export function specs(RouteXxl, property, should) {
    describe(property, () => {
        let foos: Foo[],
            spyFoo;

        let spy;

        beforeEach(() => {
            spyFoo = Foo.prototype.ngOnInit = sinon.spy();
        });

        it('should exist', () => {
            should.exist(RouteXxl);
        });

        describe('As observables', () => {
            beforeEach(() => {
                RouteXxl('foa')(Foo.prototype, 'a$', 0);
                RouteXxl('foa', 'fob')(Foo.prototype, 'ab$', 0);
                RouteXxl()(Foo.prototype, 'foc$', 0);

                foos = helper.build(property);

                foos.forEach(foo => foo.ngOnInit());
            });

            it('should have replaced ngOnInit', () => {
               foos[0].should.not.equal(spyFoo);
            });

            it('should have called called the spy for each instance', () => {
                spyFoo.should.have.callCount(3);
            });

            it('should have replaced ngOnInit permanently', () => {
               Foo.prototype.ngOnInit.should.not.equal(spyFoo);
            });

            it('should have bind all observables', () => {
                for (let i = 0; i < 3; i++) {
                    foos[i].a$.should.be.instanceOf(Observable);
                    foos[i].ab$.should.be.instanceOf(Observable);
                    foos[i].foc$.should.be.instanceOf(Observable);
                }
            });

            it('should have given each a unique observable', () => {
                foos[0].should.not.equal(foos[1]);
            });

            describe('Set route values', () => {
                const data = {id: 1};

                describe('Root', () => {
                    beforeEach(() => {
                        updateRoute(0, {foa: data});
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
                    });
                });

                describe('Root -> First child', () => {
                    beforeEach(() => {
                        updateRoute(1, {foa: data});
                    });

                    describe('Foo.a$', () => {
                        it('should send the data to the right routes', () => {
                            spy = sinon.spy();
                            foos.filter((v, i) => i > 0)
                                .forEach(foo => foo.a$.subscribe(spy));

                            // Foo receives the data
                            // spy.should.have.calledTwice;
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
                        updateRoute(1, {foa: data});
                    });

                    describe('Foo.a$', () => {
                        it('should send the data to the right routes', () => {
                            spy = sinon.spy();
                            foos[2].a$.subscribe(spy);
                            // spy.should.have.calledOnce;
                            spy.should.have.been.calledWith(data);

                        });

                        it('should skip the root', () => {
                            spy = sinon.spy();
                            foos.filter((v, i) => i < 2)
                                .forEach(foo => foo.a$.subscribe(spy));

                            // Foo receives the data
                            // spy.should.have.calledTwice;
                            spy.should.have.been.calledWith(undefined);
                        });
                    });
                });
            });

            describe('Multi value route', () => {
                const data = {id: 2};

                describe('single value', () => {
                    beforeEach(() => {
                        updateRoute(0, {foa: data});
                    });

                    it('should have set a value on ab$ of Foo', () => {
                        spy = sinon.spy();
                        foos[0].ab$.subscribe(spy);

                        spy.should.have.been.calledOnce;
                        spy.should.have.been.calledWith({foa: data});
                    });
                });

                describe('multi value (single route)', () => {
                    const data1 = {id: 3};

                    beforeEach(() => {
                        updateRoute(0, {baa: data, bab: data1});
                    });

                    it('should have set a value on ab$', () => {
                        spy = sinon.spy();
                        foos[0].ab$.subscribe(spy);
                        spy.should.have.been.calledOnce;
                        spy.should.have.been.calledWith({});
                    });
                });
            });

            describe('Implicit value', () => {
                const data = {id: 4};

                beforeEach(() => {
                    updateRoute(1, {foc: data});
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

                foos = helper.build(property);

                foos.forEach(foo => foo.ngOnInit());
            });

            describe('Implicit value route', () => {
                beforeEach(() => {
                    updateRoute(0, {foc: 8});
                });

                it('should have set the value', () => {
                    foos.forEach(foo => foo.foc.should.equal(8));
                });
            });

            describe('Single value route', () => {
                beforeEach(() => {
                    updateRoute(0, {foa: 8});
                });

                it('should have set the value', () => {
                    foos.forEach(foo => foo.a$.should.equal(8));
                });

                it('should have set one value on the multi object', () => {
                    foos.forEach(foo => foo.ab$.should.eql({foa: 8}));
                });
            });

            describe('Multi value route', () => {
                beforeEach(() => {
                    updateRoute(0, {foa: 8, fob: 9});
                });

                it('should have set the value', () => {
                    foos.forEach(foo => foo.ab$.should.eql({foa: 8, fob: 9}));
                });
            });

            describe('Value propagation', () => {
                const data = {foa: 9};

                beforeEach(() => {
                    updateRoute(1, data);
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

                foos = helper.build(property);

                foos.forEach(foo => foo.ngOnInit());
            });

            describe('As observable', () => {
                beforeEach(() => {
                    updateRoute(1, {foa: 1, fob: 2, foc: 3});
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
                (function() {
                    RouteXxl('foa')(Foo.prototype, 'a$', 0);
                }).should.throw('ngOnInit() should exist on the component, otherwise the decorator will not work with the AOT compiler!!');
            });
        });

        describe('Without route', () => {
            beforeEach(() => {
                RouteXxl('foa')(Foo.prototype, 'a$', 0);
            });

            it('should throw an missing route error', () => {
                (function() {
                    new Foo(null).ngOnInit();
                }).should.throw('Foo uses a angular-xxl @decorator without a \'route: ActivatedRoute\' property');
            });
        });

        after(() => {
            Foo.prototype.ngOnInit = function(): void {};
        });
    });
}

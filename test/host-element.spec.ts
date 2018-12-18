import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators';
import * as sinon from 'sinon';
import { HostElement, ResizeObserver } from '../src/host-element.decorator';

function triggerChange(width, height, instance, index?): void {
    const entries = [{contentRect: {width, height}}];

    instance['cbs']
        .forEach((cb, i) => {
            if (index === undefined || i === index) {
                cb(entries);
            }
        });
}

export function hostElementSpecs(should): void {
    describe('HostElement', () => {
        let instance: ResizeObserver, Component, clock, element, comp;
        let ngOnInitSpy, ngOnDestroySpy;

        beforeEach(() => {
            element = {nativeElement: {querySelector: sinon.spy()}};
            clock = sinon.useFakeTimers();
            Component = function(): void  {
                this.element = element;
            };
            Component.prototype = {
                ngOnInit: () => {},
                ngOnDestroy: () => {},
            };

            instance = {
                observe: sinon.spy(),
                disconnect: sinon.spy(),
            };
            instance['cbs'] = [];

            ngOnInitSpy = sinon.spy(Component.prototype, 'ngOnInit');
            ngOnDestroySpy = sinon.spy(Component.prototype, 'ngOnDestroy');

            window.ResizeObserver = (cb) => {
                instance['cbs'].push(cb);

                return instance;
            };
        });

        afterEach(() => {
            clock.restore();
        });

        it('should just be a function', () => {
            HostElement.should.be.a('function');
        });

        it('should apply currying', () => {
            HostElement().should.be.a('function');
        });

        describe('Monitor', () => {
            describe('Width', () => {
                beforeEach(() => {
                    HostElement('width', { observable: false})(Component.prototype, 'x');
                    HostElement({ observable: false})(Component.prototype, 'width');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                it('should have created the resize observer', () => {
                    instance['cbs'].length.should.equal(2); // `observe` called 2 times!
                });

                it('should have set the target to be observed', () => {
                    instance.observe.should.have.been.calledWith(element.nativeElement);
                });

                it('should have eventually called the original ngOnInit once', () => {
                    ngOnInitSpy.should.have.been.calledOnce;
                });

                it('should cleanup onDestroy', () => {
                    comp.ngOnDestroy();

                    ngOnDestroySpy.should.have.been.calledOnce;
                    instance.disconnect.should.have.been.calledTwice;
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(5, 6, instance, 0); // value for implicit
                        triggerChange(7, 8, instance, 1); // value for explicit
                    });

                    it('should update the explicit width', () => {
                        // Not 5!! This is the result of how `ngOnInit` is replaced -> FILO!!!!
                        comp.x.should.equal(7);
                    });

                    it('should update the implicit width', () => {
                        comp.width.should.equal(5);
                    });
                });
            });

            describe('Height', () => {
                beforeEach(() => {
                    HostElement('height', { observable: false})(Component.prototype, 'y');
                    HostElement({ observable: false})(Component.prototype, 'height');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(8, 9, instance, 0);
                        triggerChange(10, 11, instance, 1);
                    });

                    it('should update the explicit height', () => {
                        comp.y.should.equal(11);
                    });

                    it('should update the implicit height', () => {
                        comp.height.should.equal(9);
                    });
                });
            });

            describe('Width as Observable', () => {
                beforeEach(() => {
                    HostElement('width')(Component.prototype, 'w$');
                    HostElement()(Component.prototype, 'width$');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                it('should have set an Observable on the explicit width', () => {
                    comp.w$.should.be.instanceOf(Observable);
                });

                it('should have set an Observable on the implicit width', () => {
                    comp.width$.should.be.instanceOf(Observable);
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(11, 12, instance, 0);
                        triggerChange(13, 14, instance, 1);
                    });

                    it('should update the explicit width', (done) => {
                        comp.w$.subscribe(val => {
                            val.should.equal(13);
                            done();
                        });
                    });

                    it('should update the implicit width', (done) => {
                        comp.width$.subscribe(val => {
                            val.should.equal(11);
                            done();
                        });
                    });
                });
            });

            describe('Height/Width', () => {
                beforeEach(() => {
                    HostElement('height', 'width', { observable: false })(Component.prototype, 'wh');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(8, 18, instance);
                    });

                    it('should update both width and height', () => {
                        comp.wh.should.eql({width: 8, height: 18});
                    });
                });
            });

            describe('Height/Width as Observable', () => {
                beforeEach(() => {
                    HostElement('height', 'width')(Component.prototype, 'wh$');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(8, 18, instance);
                    });

                    it('should update both width and height', (done) => {
                        comp.wh$.subscribe(wh => {
                            wh.should.eql({width: 8, height: 18});
                            done();
                        });
                    });
                });
            });

            describe('Using a selector', () => {
                beforeEach(() => {
                    HostElement('height', { selector: '.foo'})(Component.prototype, 'h');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                it('should have queried for the inner element', () => {
                    element.nativeElement.querySelector.should.have.been.calledWith('.foo');
                });

            });

            describe('Using a pipe', () => {
                beforeEach(() => {
                    HostElement('height', 'width', { observable: false, pipe: [
                        map((wh: any) => {
                            wh.width += 1;
                            wh.height += 2;

                            return wh;
                        }),
                        filter((wh: any) => wh.width < 20),
                        ]})(Component.prototype, 'wh');

                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change passing filter', () => {
                    beforeEach(() => {
                        triggerChange(8, 18, instance, 0);
                    });

                    it('should updated the wh value', () => {
                        comp.wh.should.eql({width: 9, height: 20});
                    });
                });

                describe('Trigger change failing filter', () => {
                    beforeEach(() => {
                        triggerChange(2, 5, instance, 0);
                        triggerChange(19, 18, instance, 0);
                    });

                    it('should updated the wh value', () => {
                        comp.wh.should.eql({width: 3, height: 7});
                    });
                });
            });
        });
    });
}

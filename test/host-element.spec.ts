import * as sinon from 'sinon';
import { HostElement, ResizeObserver } from '../src/host-element.decorator';

export function hostElementSpecs(should): void {
    describe.only('HostElement', () => {
        let instance: ResizeObserver, Component, clock, element;
        let ngOnInitSpy, ngOnDestroySpy,
            observeSpy, disconnectSpy;

        beforeEach(() => {
            element = {};
            //clock = sinon.useFakeTimers();
            Component = function() {
                this.element = element;
            };
            Component.prototype = { ngOnInit: () => {}, ngOnDestroy: () => {}};

            instance = {
                observe: () => {
                },
                disconnect: () => {
                },
            };
            ngOnInitSpy = sinon.spy(Component.prototype, 'ngOnInit');
            ngOnDestroySpy = sinon.spy(Component.prototype, 'ngOnDestroy');
            observeSpy = sinon.spy(instance, 'observe');
            disconnectSpy = sinon.spy(instance, 'disconnect');

            window.ResizeObserver = (cb) => {
                instance['_cb'] = cb;

                return instance;
            };
        });

        /*
        afterEach(function () {
    clock.restore();
});
         */

        it('should just be a function', () => {
            HostElement.should.be.a('function');
        });

        it('should apply currying', () => {
            HostElement().should.be.a('function');
        });

        describe('1 argument', () => {
            beforeEach(() => {
                console.log("START");
                debugger;
                HostElement('width')(Component.prototype, 'w$');
                new Component().ngOnInit();
            });

            it('should have created the resize observer', (done) => {
                setTimeout(() => {
                    should.exist(instance['_cb']);
                    done();
                });
            });
        });

    });
}

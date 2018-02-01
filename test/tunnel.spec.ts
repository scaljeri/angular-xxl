import * as sinon from 'sinon';

import * as helper from './helpers';
import { Foo } from './helpers';

export function specs(RouteTunnel, should): void {
    describe('RouteTunnel', () => {
        let foos: Foo[], fooSpy;

        it('should exist', () => {
            should.exist(RouteTunnel);
        });

        const fooSpies = [sinon.spy(), sinon.spy(), sinon.spy()];

        beforeEach(() => {
            fooSpy = (Foo.prototype.ngOnInit = sinon.spy());
            RouteTunnel()(Foo.prototype, 'tunnel');

            foos = helper.build();

            foos.forEach((foo, i) => {
                foo.ngOnInit();
                foo.tunnel.stream$.subscribe(fooSpies[i]);
            });
        });

        it('should call the original ngOnInit once for each instance', () => {
           fooSpy.should.have.been.calledThrice;
        });

        describe('Send', () => {
            const data = {id: 99};

            beforeEach(() => {
                foos[0].tunnel.emit(data);
            });

            it('should broadcast to all', () => {
                fooSpies.forEach(spy => {
                    spy.should.have.been.calledWith(data);
                });
            });
        });

        after(() => {
            Foo.prototype.ngOnInit = function(): void {};
        });
    });
}

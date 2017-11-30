import * as sinon from 'sinon';

import * as helper from './helpers';
import { Bar, Foo } from './helpers';

export function specs(RouteTunnel, should) {
    describe('RouteTunnel', () => {
        let foos: Foo[],
            bars: Bar[],
            spyFoo, spyBar, route, subjects;

        it('should exist', () => {
            should.exist(RouteTunnel);
        });

        const fooSpies = [sinon.spy(), sinon.spy(), sinon.spy()];
        const barSpies = [sinon.spy(), sinon.spy(), sinon.spy()];

        beforeEach(() => {
            helper.setup();

            RouteTunnel()(Foo.prototype, 'tunnel$');
            RouteTunnel()(Bar.prototype, 'tunnel$');

            ({foos, bars, route, subjects} = helper.build());

            foos.forEach((foo, i) => {
                foo.ngOnInit();
                foo.tunnel$.subscribe(fooSpies[i]);
            });
            bars.forEach((bar, i) => {
                bar.ngOnInit();
                bar.tunnel$.subscribe(barSpies[i]);
            });
        });

        describe('Send', () => {
            const data = {id: 99};

            beforeEach(() => {
                foos[0].tunnel$.next(data);
            });

            it('should broadcast to', () => {
                fooSpies.forEach(spy => {
                    spy.should.have.been.calledWith(data);
                });
            });

            it('should not have called other tunnels', () => {
                barSpies.forEach(spy => {
                    spy.should.not.have.been.called;
                });
            });
        });
    });
}



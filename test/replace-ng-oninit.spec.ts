import * as sinon from "sinon";
import { NG_ON_INIT, IVY_ON_INIT, replaceNgOnInit, IVY_PROTOTYPE } from '../src/replace-ng-oninit';

export function replaceNgOnInitSpec(should): void {
    describe("replaceNgOnInit", () => {
        let proto;
        let callback;
        let ngOnInit;
        let ivyNgOnInit;

        beforeEach(() => {
            ngOnInit = sinon.spy()

            proto = {
                [NG_ON_INIT]: ngOnInit
            };

            callback = sinon.spy();
        })

        describe('Without Ivy', () => {
            beforeEach(() => {
                replaceNgOnInit(proto, callback)
                proto.ngOnInit();
            });

            it('should replace ngOnInit', () => {
                proto.ngOnInit.should.not.equal(ngOnInit);
            });

            it('should call the decorator\'s ngOnInit', () => {
                callback.should.be.called;
            });

            it('should call the original ngOnInit', () => {
                ngOnInit.should.have.been.calledOnce;
            });
        });

        describe('With Ivy', () => {
            let ivyProto;

            beforeEach(() => {
                ivyNgOnInit = sinon.spy();
                ivyProto = { [IVY_ON_INIT]: ivyNgOnInit };

                proto.constructor = {
                    ...proto,
                    [IVY_PROTOTYPE]: ivyProto
                };

                replaceNgOnInit(proto, callback)
                ivyProto[IVY_ON_INIT]();
            });

            it('should replace ngOnInit', () => {
                ivyProto[IVY_ON_INIT].should.not.equal(ivyNgOnInit);
            });

            it('should call the decorator\'s ngOnInit', () => {
                callback.should.have.been.calledOnce;
            });

            it('should call the original ngOnInit', () => {
                ivyNgOnInit.should.have.been.calledOnce;
            });
        });
    });
}

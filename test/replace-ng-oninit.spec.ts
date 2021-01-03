import * as sinon from "sinon";
import { NG_ON_INIT, replaceNgOnInit } from '../src/replace-ng-oninit';

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
    });
}

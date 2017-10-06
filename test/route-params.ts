import { expect } from 'chai';
import { RouteParams } from '../src/route-params';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as chai from 'chai';

const should = chai.should();
chai.use(sinonChai);

describe('Decorator RouteParams', () => {
    let comp, spy;

    beforeEach(() => {
        spy = sinon.spy();

        comp = { ngOnInit: spy };
    });

    it('should exist', () => {
        expect(RouteParams).should.exist;
    });

    describe('Not nested', () => {
       beforeEach(() => {
           comp.route = {
               params: {map: cb => cb({contactId: {}})}
           };

           RouteParams('contactId')(comp, 'params$', 0);
           comp.ngOnInit();
       });

       it('should have found the param', () => {
           should.exist(comp.params$);
       });

       it('should have called ngOnInit', () => {
           spy.should.have.been.called;
       });

       it('should have restored ngOnInit', () => {
           comp.ngOnInit.should.equals(spy);
       });
    });

    describe('Nested', () => {
        beforeEach(() => {
            let params = {map: cb => cb({})};

            comp.route = {
                params,
                parent: {
                    params,
                    parent: {
                        params: {map: cb => cb({contactId: {}})}
                    }
                }
            };

            RouteParams('contactId')(comp, 'params$', 0);
            comp.ngOnInit();
        });

        it('should have found the param', () => {
            should.exist(comp.params$);
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });
    });

    describe('Without ngOnInit', () => {
        beforeEach(() => {
            delete comp.ngOnInit;
            comp.route = { params: {map: cb => cb({contactId: {}})}};

            RouteParams('contactId')(comp, 'params$', 0);
        });

        it('should have created ngOnInit', () => {
            comp.ngOnInit.should.exist;
        });

        it('should inject the data', () => {
            comp.ngOnInit();

            comp.params$.should.exist;
        });

        it('should remove the fake ngOnInit', () => {
            comp.ngOnInit();

            should.not.exist(comp.ngOnInit);
        });
    });

    describe('Without params', () => {
        beforeEach(() => {
            comp.route = {
                params: {map: cb => cb({contactId: {}})}
            };

            RouteParams()(comp, 'contactId$', 0);
            comp.ngOnInit();
        });

        it('should have set the data', () => {
            comp.contactId$.should.exist;
        });
    });
});
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
               params: {map: cb => cb({contacts: {}})}
           };

           RouteParams('contacts')(comp, 'params$', 0);
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
                        params: {map: cb => cb({contacts: {}})}
                    }
                }
            };

            RouteParams('contacts')(comp, 'params$', 0);
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
});
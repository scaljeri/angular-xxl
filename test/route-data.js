"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var route_data_1 = require("../src/route-data");
require("mocha");
var sinonChai = require("sinon-chai");
var sinon = require("sinon");
var chai = require("chai");
var should = chai.should();
chai.use(sinonChai);
describe('Decorator RouteData', function () {
    var comp, spy;
    beforeEach(function () {
        spy = sinon.spy();
        comp = { ngOnInit: spy };
    });
    it('should exist', function () {
        chai_1.expect(route_data_1.RouteData).should.exist;
    });
    describe('Not nested', function () {
        beforeEach(function () {
            comp.route = {
                data: { map: function (cb) { return cb({ contacts: {} }); } }
            };
            route_data_1.RouteData('contacts')(comp, 'data$', 0);
            comp.ngOnInit();
        });
        it('should have found the data', function () {
            should.exist(comp.data$);
        });
        it('should have called ngOnInit', function () {
            spy.should.have.been.called;
        });
        it('should have restored ngOnInit', function () {
            comp.ngOnInit.should.equals(spy);
        });
    });
    describe('Nested', function () {
        beforeEach(function () {
            var data = { map: function (cb) { return cb({}); } };
            comp.route = {
                data: data,
                parent: {
                    data: data,
                    parent: {
                        data: { map: function (cb) { return cb({ contacts: {} }); } }
                    }
                }
            };
            route_data_1.RouteData('contacts')(comp, 'data$', 0);
            comp.ngOnInit();
        });
        it('should have found the data', function () {
            should.exist(comp.data$);
        });
        it('should have called ngOnInit', function () {
            spy.should.have.been.called;
        });
        it('should have restored ngOnInit', function () {
            comp.ngOnInit.should.equals(spy);
        });
    });
    describe('Without ngOnInit', function () {
        beforeEach(function () {
            delete comp.ngOnInit;
            comp.route = { data: { map: function (cb) { return cb({ contacts: {} }); } } };
            route_data_1.RouteData('contacts')(comp, 'contacts$', 0);
        });
        it('should have created ngOnInit', function () {
            comp.ngOnInit.should.exist;
        });
        it('should inject the data', function () {
            comp.ngOnInit();
            comp.contacts$.should.exist;
        });
        it('should remove the fake ngOnInit', function () {
            comp.ngOnInit();
            should.not.exist(comp.ngOnInit);
        });
    });
});

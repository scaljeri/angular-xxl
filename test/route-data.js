"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var route_data_1 = require("../src/route-data");
require("mocha");
var chai = require("chai");
var should = chai.should();
describe('Hello function', function () {
    it('should exist', function () {
        chai_1.expect(route_data_1.RouteData).should.exist;
    });
});

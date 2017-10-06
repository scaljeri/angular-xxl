import { expect } from 'chai';
import { RouteData } from '../src/route-data';
import 'mocha';
import * as chai from 'chai';

const should = chai.should();

describe('Hello function', () => {
    it('should exist', () => {
        expect(RouteData).should.exist;
    });
});
import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as chai from 'chai';

const should = chai.should();
chai.use(sinonChai);

import { routeDecoratorFactory } from '../src/route-decorators';

import { specs as dataParamSpecs } from './route-data-params.spec';
import { specs as queryParamSpecs } from './route-query-params.spec';

dataParamSpecs(routeDecoratorFactory('data'), 'data', should);
dataParamSpecs(routeDecoratorFactory('params'), 'params', should);
queryParamSpecs(routeDecoratorFactory('queryParams'), should);

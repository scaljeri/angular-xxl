import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as chai from 'chai';

const should = chai.should();
chai.use(sinonChai);

import { RouteData, RouteParams, RouteQueryParams, RouteTunnel } from '../src/route-decorators';

import { specs as dataParamSpecs } from './route-data-params.spec';
import { specs as pipeSpecs } from './route-pipes.spec';
import { specs as queryParamSpecs } from './route-query-params.spec';
import { specs as tunnelSpecs } from './route-tunnel.spec';

dataParamSpecs(RouteData, 'data', should);
dataParamSpecs(RouteParams, 'params', should);
queryParamSpecs(RouteQueryParams, should);
pipeSpecs(RouteQueryParams, should);
tunnelSpecs(RouteTunnel, should);


import * as chai from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai';

declare var global: any;

const should = chai.should();
chai.use(sinonChai);

global.window = {};

import { RouteData, RouteParams, RouteQueryParams } from '../src/route.decorators';

import { Tunnel } from '../src/tunnel.decorator';
import { hostElementSpecs } from './host-element.spec';
import { specs as dataParamSpecs } from './route-data-params.spec';
import { specs as pipeSpecs } from './route-pipe.spec';
import { specs as queryParamSpecs } from './route-query-params.spec';
import { specs as tunnelSpecs } from './tunnel.spec';

dataParamSpecs(RouteData, 'data', should);
dataParamSpecs(RouteParams, 'params', should);
queryParamSpecs(RouteQueryParams, should);
pipeSpecs(RouteQueryParams, should);
tunnelSpecs(Tunnel, should);

hostElementSpecs(should);

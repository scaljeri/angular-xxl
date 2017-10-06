"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteParams = function (annotation) {
    return function (target, key, index) {
        var ngOnInit = target.ngOnInit;
        target.ngOnInit = function () {
            var parent = this.route, params = null;
            while (parent && !params) {
                params = parent.params.map(function (d) { return d[annotation]; });
                parent = parent.parent;
            }
            target[key] = params;
            ngOnInit.call(this);
            target.ngOnInit = ngOnInit;
        };
    };
};

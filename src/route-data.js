"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteData = function (annotation) {
    return function (target, key, index) {
        var ngOnInit = target.ngOnInit;
        target.ngOnInit = function () {
            var parent = this.route, data = null;
            while (parent && !data) {
                data = parent.data.map(function (d) { return d[annotation]; });
                parent = parent.parent;
            }
            target[key] = data;
            ngOnInit.call(this);
            this.ngOnInit = ngOnInit;
        };
    };
};

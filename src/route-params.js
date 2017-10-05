function RouteParams(annotation) {
    return function (target, key, index) {
        target._ngOnInit = target.ngOnInit;
        target.ngOnInit = function () {
            var parent = this.route;
            var data = null;
            while (parent && !data) {
                data = parent.data.map(function (d) { return d[annotation]; });
                parent = parent.parent;
            }
            target[key] = data;
            target._ngOnInit.call(this);
        };
    };
}

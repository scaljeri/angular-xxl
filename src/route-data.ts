export const RouteData = function (annotation?: any): any {
    return (target: any, key: string, index: number) => {
        target._ngOnInit = target.ngOnInit;
        target.ngOnInit = function () {
            let parent = this.route;
            let data = null;

            while (parent && !data) {
                data = parent.data.map(d => d[annotation]);
                parent = parent.parent;
            }

            target[key] = data;

            target._ngOnInit.call(this);
        };
    }
}

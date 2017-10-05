export const RouteParams = function (annotation?: any): any {
    return (target: any, key: string, index: number) => {
        target._ngOnInit = target.ngOnInit;
        target.ngOnInit = function () {
            let parent = this.route;
            let params = null;

            while (parent && !params) {
                params = parent.params.map(d => d[annotation]);
                parent = parent.parent;
            }

            target[key] = data;

            target._ngOnInit.call(this);
        };
    }
}
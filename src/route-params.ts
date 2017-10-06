export const RouteParams = function (annotation?: any): any {
    return (target: any, key: string, index: number): void => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = this.route,
                params = null;

            while (parent && !params) {
                params = parent.params.map(d => d[annotation || key]);
                parent = parent.parent;
            }

            target[key] = params;

            delete this.ngOnInit;
            if (ngOnInit) {
                ngOnInit.call(this);
                target.ngOnInit = ngOnInit;
            }
        };
    };
};

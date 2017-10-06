export const RouteData = function (annotation?: string): any {
    return (target: any, key: string, index: number): void => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = this.route,
                data = null;

            while (parent && !data) {
                data = parent.data.map(d => d[annotation || key]);
                parent = parent.parent;
            }

            target[key] = data;

            delete this.ngOnInit;
            if (ngOnInit) {
                ngOnInit.call(this);
                this.ngOnInit = ngOnInit;
            }
        };
    };
};

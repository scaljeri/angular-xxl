export const RouteData = function (annotation?: any): (any, string, index) => void {
    return (target: any, key: string, index: number) => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = this.route,
                data = null;

            while (parent && !data) {
                data = parent.data.map(d => d[annotation]);
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

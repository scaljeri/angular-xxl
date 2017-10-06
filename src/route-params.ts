export const RouteParams = function (annotation?: any): any {
    return (target: any, key: string, index: number) => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = this.route;
            let data = null;

            while (parent && !data) {
                data = parent.data.map(d => d[annotation]);
                parent = parent.parent;
            }


            target[key] = data;

            ngOnInit.call(this);
            target.ngOnInit = ngOnInit;
        };
    }
};

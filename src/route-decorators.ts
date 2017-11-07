import 'rxjs/add/operator/map';

export interface RouteXxlConfig {
    observable?: boolean;
}

export function routeDecoratorFactory(routePropertyName) {
    return function (annotation?: string, config?: RouteXxlConfig): any {
        return (target: any, key: string, index: number): void => {
            const ngOnInit = target.ngOnInit;

            target.ngOnInit = function (): void {
                let parent = this.route,
                    routePropertyValue = null;

                while (parent && !routePropertyValue) {
                    const targetKeyName = annotation || key.replace(/\$$/, '');
                    routePropertyValue = parent[routePropertyName].map(d => d[targetKeyName]);

                    parent = parent.parent;
                }

                if (config && !config.observable) {
                    routePropertyValue.subscribe(val => target[key] = val)
                } else {
                    target[key] = routePropertyValue;
                }

                delete this.ngOnInit;
                if (ngOnInit) {
                    ngOnInit.call(this);
                    this.ngOnInit = ngOnInit;
                }
            };
        };
    };
}

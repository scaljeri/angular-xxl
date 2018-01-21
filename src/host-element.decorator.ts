import { Subject } from 'rxjs/Subject';

declare global {
    interface Window {
        ResizeObserver: any;
    }
}

export interface HostElementConfig {
    pipe?: any[];
    selector?: string;
    observable?: boolean;
}

interface XxlMutations {

}

function monitor(target: HTMLElement, property: string, callback: (mutations: XxlMutations) => any): void {
    if (property === 'style') {
        const observer = new MutationObserver(muatations => {
            // this[key] = extractProperty(target, propertyList.slice());
        });

        observer.observe(target, {attributes: true, attributeOldValue: false, attributeFilter: [property]});
    } else if (property === 'width') {
        resizeObserver(target, callback);
    }
}

export function HostElement(...args: Array<string | HostElementConfig>): PropertyDecorator {
    const config = (args ? args.pop() : {}) as HostElementConfig;

    return function factory(proto: { ngOnInit(): void }, key: any): void {
        const ngOnInit = proto.ngOnInit; // Keep ref to original ngOnInit

        proto.ngOnInit = function(): void {
            // this.width = this.element.nativeElement.clientWidth;
            (args || [key]).forEach((item: string) => {
                const propertyParts = item.split('.');
                const target = config.selector ? this.element.nativeElement.querySelector(config.selector) : this.element.nativeElement;

                monitor(target, propertyParts[0], (mutations) => {

                });
            });

            const propertyList = args[0].split('.');
            const target = config.selector ? this.element.nativeElement.querySelector(config.selector) : this.element.nativeElement;
            console.log(propertyList[0]);
            if (target[propertyList[0]]) {
                const observer = new MutationObserver(muatations => {
                    this[key] = extractProperty(target, propertyList.slice());
                });

                observer.observe(target, {attributes: true, attributeOldValue: true, attributeFilter: [propertyList[0]]});
            } else {
                if (window.ResizeObserver) { // Only Chrome > 65
                    const ro = new window.ResizeObserver(entries => {
                        for (const entry of entries) {
                            const cr = entry.contentRect;
                            console.log('Element:', entry.target);
                            console.log(`Element size: ${cr.width}px x ${cr.height}px`);
                            console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);

                            this[key] = cr[propertyList[0]];
                        }

                    });

                    ro.observe(target);
                } else { // anything else
                    resizeObserverPolyfill(target, () => {
                        this[key] = window.getComputedStyle(target)[propertyList[0]];
                    });
                }
            }

            ngOnInit.call(this);
        };
    };
}

function extractProperty(source, list) {
    if (list.length === 0) {
        return source;
    }

    return extractProperty(source[list.shift()], list);
}

function resizeObserver(element, callback): void {
    let zIndex = parseInt(window['getComputedStyle'](element).zIndex, 10);
    if (isNaN(zIndex)) {
        zIndex = 0;
    }

    zIndex--;

    const expand = document.createElement('div');
    expand.style.position = 'absolute';
    expand.style.left = '0px';
    expand.style.top = '0px';
    expand.style.right = '0px';
    expand.style.bottom = '0px';
    expand.style.overflow = 'hidden';
    expand.style.zIndex = '' + zIndex;
    expand.style.visibility = 'hidden';

    const expandChild = document.createElement('div');
    expandChild.style.position = 'absolute';
    expandChild.style.left = '0px';
    expandChild.style.top = '0px';
    expandChild.style.width = '10000000px';
    expandChild.style.height = '10000000px';
    expand.appendChild(expandChild);

    const shrink = document.createElement('div');
    shrink.style.position = 'absolute';
    shrink.style.left = '0px';
    shrink.style.top = '0px';
    shrink.style.right = '0px';
    shrink.style.bottom = '0px';
    shrink.style.overflow = 'hidden';
    shrink.style.zIndex = '' + zIndex;
    shrink.style.visibility = 'hidden';

    const shrinkChild = document.createElement('div');
    shrinkChild.style.position = 'absolute';
    shrinkChild.style.left = '0px';
    shrinkChild.style.top = '0px';
    shrinkChild.style.width = '200%';
    shrinkChild.style.height = '200%';
    shrink.appendChild(shrinkChild);

    element.appendChild(expand);
    element.appendChild(shrink);

    function setScroll(): void {
        expand.scrollLeft = 10000000;
        expand.scrollTop = 10000000;

        shrink.scrollLeft = 10000000;
        shrink.scrollTop = 10000000;
    }
    setScroll();

    const initialSize = element.getBoundingClientRect();

    let currentWidth = initialSize.width;
    let currentHeight = initialSize.height;

    const onScroll = (): void => {
        const size = element.getBoundingClientRect(),
            width = size.width,
            height = size.height;

        if (width !== currentWidth || height !== currentHeight) {
            currentWidth = width;
            currentHeight = height;

            callback({width, height});
        }

        setScroll();
    };

    expand.addEventListener('scroll', onScroll);
    shrink.addEventListener('scroll', onScroll);
}

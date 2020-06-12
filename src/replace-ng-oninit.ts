export const NG_ON_INIT = 'ngOnInit';
export const IVY_ON_INIT = 'onInit';
export const IVY_PROTOTYPE = 'ɵcmp';

export function replaceNgOnInit(proto, fn) {
    const target = proto.constructor;
    let onInitName = NG_ON_INIT;

    // Is there an IVY prototype
    if (target[IVY_PROTOTYPE]) {
        proto = target[IVY_PROTOTYPE];
        onInitName = IVY_ON_INIT;
    }

    const origNgOnInit = proto[onInitName];
    if (!origNgOnInit) {
        throw new Error('ngOnInit() should exist on the component, otherwise the decorator will not work with the AOT compiler!!');
    }

    proto[onInitName] = function () {
        fn.call(this);
        origNgOnInit.call(this);
    }
}

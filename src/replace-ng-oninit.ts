export const NG_ON_INIT = 'ngOnInit';

export function replaceNgOnInit(proto, fn) {
    const target = proto.constructor;
    let onInitName = NG_ON_INIT;


    const origNgOnInit = proto[onInitName];
    if (!origNgOnInit) {
        throw new Error('ngOnInit() should exist on the component, otherwise the decorator will not work with the AOT compiler!!');
    }

    proto[onInitName] = function () {
        fn.call(this);
        origNgOnInit.call(this);
    }
}

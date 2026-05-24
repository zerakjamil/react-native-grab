import React from "react";
let isPatched = false;
export const patchReactNativeModal = (ReactNativeGrabModal) => {
    if (isPatched)
        return;
    isPatched = true;
    try {
        const ModalModule = require("react-native/Libraries/Modal/Modal");
        const OriginalModal = ModalModule.default || ModalModule;
        if (!OriginalModal)
            return;
        const PatchedModal = React.forwardRef((props, ref) => {
            return React.createElement(OriginalModal, { ...props, ref }, React.createElement(ReactNativeGrabModal, { style: { flex: 1 } }, props.children));
        });
        Object.assign(PatchedModal, OriginalModal);
        PatchedModal.displayName = "ReactNativeGrabPatchedModal";
        if (ModalModule.default) {
            ModalModule.default = PatchedModal;
        }
        else {
            ModalModule.default = PatchedModal;
            Object.keys(OriginalModal).forEach((key) => {
                try {
                    ModalModule[key] = OriginalModal[key];
                }
                catch { }
            });
        }
        const origCreateElement = React.createElement.bind(React);
        React.createElement = function patchedCreateElement(type, config, ...children) {
            if (type === OriginalModal) {
                const grabWrapped = origCreateElement(ReactNativeGrabModal, { style: { flex: 1 } }, ...children);
                return origCreateElement(OriginalModal, config, grabWrapped);
            }
            return origCreateElement(type, config, ...children);
        };
    }
    catch (err) {
        console.warn("[react-native-grab] Failed to patch React Native Modal", err);
    }
};
//# sourceMappingURL=patch-modal.js.map
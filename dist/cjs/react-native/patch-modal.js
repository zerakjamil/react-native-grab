"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchReactNativeModal = void 0;
const react_1 = __importDefault(require("react"));
let isPatched = false;
const patchReactNativeModal = (ReactNativeGrabModal) => {
    if (isPatched)
        return;
    isPatched = true;
    try {
        const ModalModule = require("react-native/Libraries/Modal/Modal");
        const OriginalModal = ModalModule.default || ModalModule;
        if (!OriginalModal)
            return;
        const PatchedModal = react_1.default.forwardRef((props, ref) => {
            return react_1.default.createElement(OriginalModal, { ...props, ref }, react_1.default.createElement(ReactNativeGrabModal, { style: { flex: 1 } }, props.children));
        });
        Object.assign(PatchedModal, OriginalModal);
        PatchedModal.displayName = "ReactNativeGrabPatchedModal";
        if (ModalModule.default) {
            ModalModule.default = PatchedModal;
        }
        else {
            Object.assign(ModalModule, PatchedModal);
        }
    }
    catch (err) {
        console.warn("[react-native-grab] Failed to patch React Native Modal", err);
    }
};
exports.patchReactNativeModal = patchReactNativeModal;
//# sourceMappingURL=patch-modal.js.map
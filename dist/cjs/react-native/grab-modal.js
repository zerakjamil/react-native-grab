"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeGrabModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const containers_1 = require("./containers");
const grab_overlay_1 = require("./grab-overlay");
const ReactNativeGrabModal = ({ children, style, id, isActive = true, ...props }) => {
    const modalRef = (0, react_1.useRef)(null);
    const ownerIdRef = (0, react_1.useRef)(id ?? (0, containers_1.createGrabSelectionOwnerId)("modal"));
    const [panHandlers, setPanHandlers] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!modalRef.current) {
            return;
        }
        (0, containers_1.registerGrabSelectionOwner)(ownerIdRef.current, "modal", modalRef.current);
        return () => {
            (0, containers_1.unregisterGrabSelectionOwner)(ownerIdRef.current);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (isActive) {
            (0, containers_1.setGrabSelectionOwnerFocused)(ownerIdRef.current, true);
            return () => {
                (0, containers_1.clearGrabSelectionOwnerFocus)(ownerIdRef.current);
            };
        }
    }, [isActive]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { ...props, ...(panHandlers ?? {}), collapsable: false, ref: modalRef, style: [{ flex: 1 }, style], children: [children, (0, jsx_runtime_1.jsx)(grab_overlay_1.ReactNativeGrabOverlay, { ownerId: ownerIdRef.current, onPanHandlersChange: setPanHandlers })] }));
};
exports.ReactNativeGrabModal = ReactNativeGrabModal;
//# sourceMappingURL=grab-modal.js.map
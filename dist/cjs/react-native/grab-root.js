"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeGrabRoot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const containers_1 = require("./containers");
const grab_overlay_1 = require("./grab-overlay");
const grab_root_controls_1 = require("./grab-root-controls");
const ReactNativeGrabRoot = ({ children, style, ...props }) => {
    const rootRef = (0, react_1.useRef)(null);
    const ownerIdRef = (0, react_1.useRef)((0, containers_1.createGrabSelectionOwnerId)("root"));
    const [panHandlers, setPanHandlers] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!rootRef.current) {
            return;
        }
        (0, containers_1.registerGrabSelectionOwner)(ownerIdRef.current, "root", rootRef.current);
        return () => {
            (0, containers_1.unregisterGrabSelectionOwner)(ownerIdRef.current);
        };
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { ...props, ...(panHandlers ?? {}), collapsable: false, ref: rootRef, style: [{ flex: 1 }, style], children: [children, (0, jsx_runtime_1.jsx)(grab_overlay_1.ReactNativeGrabOverlay, { ownerId: ownerIdRef.current, onPanHandlersChange: setPanHandlers })] }), (0, jsx_runtime_1.jsx)(grab_root_controls_1.ReactNativeGrabRootControls, {})] }));
};
exports.ReactNativeGrabRoot = ReactNativeGrabRoot;
//# sourceMappingURL=grab-root.js.map
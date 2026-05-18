"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeGrabScreen = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const containers_1 = require("./containers");
const focus_effect_1 = require("./focus-effect");
const grab_overlay_1 = require("./grab-overlay");
const useFocusEffect = (0, focus_effect_1.getFocusEffect)();
const ReactNativeGrabScreen = ({ children, style, id, ...props }) => {
    const screenRef = (0, react_1.useRef)(null);
    const ownerIdRef = (0, react_1.useRef)(id ?? (0, containers_1.createGrabSelectionOwnerId)("screen"));
    const [panHandlers, setPanHandlers] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!screenRef.current) {
            return;
        }
        (0, containers_1.registerGrabSelectionOwner)(ownerIdRef.current, "screen", screenRef.current);
        return () => {
            (0, containers_1.unregisterGrabSelectionOwner)(ownerIdRef.current);
        };
    }, []);
    useFocusEffect((0, react_1.useCallback)(() => {
        if (!screenRef.current) {
            return;
        }
        (0, containers_1.setGrabSelectionOwnerFocused)(ownerIdRef.current, true);
        return () => {
            (0, containers_1.clearGrabSelectionOwnerFocus)(ownerIdRef.current);
        };
    }, []));
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { ...props, ...(panHandlers ?? {}), collapsable: false, ref: screenRef, style: [{ flex: 1 }, style], children: [children, (0, jsx_runtime_1.jsx)(grab_overlay_1.ReactNativeGrabOverlay, { ownerId: ownerIdRef.current, onPanHandlersChange: setPanHandlers })] }));
};
exports.ReactNativeGrabScreen = ReactNativeGrabScreen;
//# sourceMappingURL=grab-screen.js.map
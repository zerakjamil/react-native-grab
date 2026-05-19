import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { createGrabSelectionOwnerId, registerGrabSelectionOwner, unregisterGrabSelectionOwner, } from "./containers";
import { ReactNativeGrabOverlay } from "./grab-overlay";
import { ReactNativeGrabRootControls } from "./grab-root-controls";
export const ReactNativeGrabRoot = ({ children, style, ...props }) => {
    const rootRef = useRef(null);
    const ownerIdRef = useRef(createGrabSelectionOwnerId("root"));
    const [panHandlers, setPanHandlers] = useState(null);
    useEffect(() => {
        if (!rootRef.current) {
            return;
        }
        registerGrabSelectionOwner(ownerIdRef.current, "root", rootRef.current);
        return () => {
            unregisterGrabSelectionOwner(ownerIdRef.current);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs(View, { ...props, ...(panHandlers ?? {}), collapsable: false, ref: rootRef, style: [{ flex: 1 }, style], children: [children, _jsx(ReactNativeGrabOverlay, { ownerId: ownerIdRef.current, onPanHandlersChange: setPanHandlers })] }), _jsx(ReactNativeGrabRootControls, {})] }));
};
//# sourceMappingURL=grab-root.js.map
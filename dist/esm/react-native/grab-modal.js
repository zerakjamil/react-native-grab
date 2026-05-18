import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import {
  clearGrabSelectionOwnerFocus,
  createGrabSelectionOwnerId,
  registerGrabSelectionOwner,
  setGrabSelectionOwnerFocused,
  unregisterGrabSelectionOwner,
} from "./containers";
import { ReactNativeGrabOverlay } from "./grab-overlay";
export const ReactNativeGrabModal = ({ children, style, id, isActive = true, ...props }) => {
  const modalRef = useRef(null);
  const ownerIdRef = useRef(id ?? createGrabSelectionOwnerId("modal"));
  const [panHandlers, setPanHandlers] = useState(null);
  useEffect(() => {
    if (!modalRef.current) {
      return;
    }
    registerGrabSelectionOwner(ownerIdRef.current, "modal", modalRef.current);
    return () => {
      unregisterGrabSelectionOwner(ownerIdRef.current);
    };
  }, []);
  useEffect(() => {
    if (isActive) {
      setGrabSelectionOwnerFocused(ownerIdRef.current, true);
      return () => {
        clearGrabSelectionOwnerFocus(ownerIdRef.current);
      };
    }
  }, [isActive]);
  return _jsxs(View, {
    ...props,
    ...(panHandlers ?? {}),
    collapsable: false,
    ref: modalRef,
    style: [{ flex: 1 }, style],
    children: [
      children,
      _jsx(ReactNativeGrabOverlay, {
        ownerId: ownerIdRef.current,
        onPanHandlersChange: setPanHandlers,
      }),
    ],
  });
};
//# sourceMappingURL=grab-modal.js.map

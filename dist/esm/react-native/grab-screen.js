import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import {
  clearGrabSelectionOwnerFocus,
  createGrabSelectionOwnerId,
  registerGrabSelectionOwner,
  setGrabSelectionOwnerFocused,
  unregisterGrabSelectionOwner,
} from "./containers";
import { getFocusEffect } from "./focus-effect";
import { ReactNativeGrabOverlay } from "./grab-overlay";
const useFocusEffect = getFocusEffect();
export const ReactNativeGrabScreen = ({ children, style, id, ...props }) => {
  const screenRef = useRef(null);
  const ownerIdRef = useRef(id ?? createGrabSelectionOwnerId("screen"));
  const [panHandlers, setPanHandlers] = useState(null);
  useEffect(() => {
    if (!screenRef.current) {
      return;
    }
    registerGrabSelectionOwner(ownerIdRef.current, "screen", screenRef.current);
    return () => {
      unregisterGrabSelectionOwner(ownerIdRef.current);
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (!screenRef.current) {
        return;
      }
      setGrabSelectionOwnerFocused(ownerIdRef.current, true);
      return () => {
        clearGrabSelectionOwnerFocus(ownerIdRef.current);
      };
    }, []),
  );
  return _jsxs(View, {
    ...props,
    ...(panHandlers ?? {}),
    collapsable: false,
    ref: screenRef,
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
//# sourceMappingURL=grab-screen.js.map

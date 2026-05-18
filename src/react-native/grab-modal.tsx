import { useEffect, useRef, useState } from "react";
import { View, type GestureResponderHandlers, type ViewProps } from "react-native";
import {
  clearGrabSelectionOwnerFocus,
  createGrabSelectionOwnerId,
  registerGrabSelectionOwner,
  setGrabSelectionOwnerFocused,
  unregisterGrabSelectionOwner,
} from "./containers";
import { ReactNativeGrabOverlay } from "./grab-overlay";

export type ReactNativeGrabModalProps = ViewProps & {
  id?: string;
  isActive?: boolean;
};

export const ReactNativeGrabModal = ({
  children,
  style,
  id,
  isActive = true,
  ...props
}: ReactNativeGrabModalProps) => {
  const modalRef = useRef<View | null>(null);
  const ownerIdRef = useRef(id ?? createGrabSelectionOwnerId("modal"));
  const [panHandlers, setPanHandlers] = useState<GestureResponderHandlers | null>(null);

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

  return (
    <View
      {...props}
      {...(panHandlers ?? {})}
      collapsable={false}
      ref={modalRef}
      style={[{ flex: 1 }, style]}
    >
      {children}
      <ReactNativeGrabOverlay ownerId={ownerIdRef.current} onPanHandlersChange={setPanHandlers} />
    </View>
  );
};

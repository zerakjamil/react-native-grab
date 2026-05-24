import React from "react";

let isPatched = false;

export const patchReactNativeModal = (ReactNativeGrabModal: React.ComponentType<any>) => {
  if (isPatched) return;
  isPatched = true;

  try {
    const ModalModule = require("react-native/Libraries/Modal/Modal");
    const OriginalModal = ModalModule.default || ModalModule;

    if (!OriginalModal) return;

    const PatchedModal = React.forwardRef((props: any, ref: any) => {
      return React.createElement(
        OriginalModal,
        { ...props, ref },
        React.createElement(ReactNativeGrabModal, { style: { flex: 1 } }, props.children),
      );
    });

    Object.assign(PatchedModal, OriginalModal);
    (PatchedModal as any).displayName = "ReactNativeGrabPatchedModal";

    if (ModalModule.default) {
      ModalModule.default = PatchedModal;
    } else {
      ModalModule.default = PatchedModal;
      Object.keys(OriginalModal).forEach((key) => {
        try {
          (ModalModule as any)[key] = (OriginalModal as any)[key];
        } catch {}
      });
    }

    const origCreateElement = React.createElement.bind(React);

    (React as any).createElement = function patchedCreateElement(
      type: any,
      config: any,
      ...children: any[]
    ) {
      if (type === OriginalModal) {
        const grabWrapped = (origCreateElement as typeof React.createElement)(
          ReactNativeGrabModal,
          { style: { flex: 1 } },
          ...children,
        );
        return (origCreateElement as typeof React.createElement)(
          OriginalModal,
          config,
          grabWrapped,
        );
      }
      return (origCreateElement as typeof React.createElement)(type, config, ...children);
    };
  } catch (err) {
    console.warn("[react-native-grab] Failed to patch React Native Modal", err);
  }
};

import type { ReactNativeGrabRootProps } from "./grab-root";
import type { ReactNativeGrabScreenProps } from "./grab-screen";
import type { ReactNativeGrabModalProps } from "./grab-modal";
import type { ReactNativeGrabContextProviderProps } from "./grab-context";
import type { ReactNode } from "react";

export type { ReactNativeGrabRootProps } from "./grab-root";
export type { ReactNativeGrabScreenProps } from "./grab-screen";
export type { ReactNativeGrabModalProps } from "./grab-modal";
export type {
  ReactNativeGrabContextProviderProps,
  ReactNativeGrabContextValue,
} from "./grab-context";

const noop = () => {};
const Passthrough = ({ children }: { children?: ReactNode }) => children;

export const ReactNativeGrabRoot: React.ComponentType<ReactNativeGrabRootProps> = __DEV__
  ? require("./grab-root").ReactNativeGrabRoot
  : Passthrough;

export const ReactNativeGrabScreen: React.ComponentType<ReactNativeGrabScreenProps> = __DEV__
  ? require("./grab-screen").ReactNativeGrabScreen
  : Passthrough;

export const ReactNativeGrabModal: React.ComponentType<ReactNativeGrabModalProps> = __DEV__
  ? require("./grab-modal").ReactNativeGrabModal
  : Passthrough;

export const ReactNativeGrabContextProvider: React.ComponentType<ReactNativeGrabContextProviderProps> =
  __DEV__ ? require("./grab-context").ReactNativeGrabContextProvider : Passthrough;

export const enableGrabbing: () => void = __DEV__
  ? require("./grab-controller").enableGrabbing
  : noop;

export const toggleGrabFreeze: () => void = __DEV__
  ? require("./grab-controller").toggleGrabFreeze
  : noop;

export const setFocusEffect: (impl: (cb: () => void) => void) => void = __DEV__
  ? require("./focus-effect").setFocusEffect
  : noop;

export const patchAllModals: () => void = __DEV__
  ? () => {
      const patchModal = require("./patch-modal").patchReactNativeModal;
      const ReactNativeGrabModal = require("./grab-modal").ReactNativeGrabModal;
      patchModal(ReactNativeGrabModal);
    }
  : noop;

if (__DEV__) {
  const patchModal = require("./patch-modal").patchReactNativeModal;
  patchModal(ReactNativeGrabModal);
}

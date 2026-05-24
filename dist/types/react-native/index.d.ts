import type { ReactNativeGrabRootProps } from "./grab-root";
import type { ReactNativeGrabScreenProps } from "./grab-screen";
import type { ReactNativeGrabModalProps } from "./grab-modal";
import type { ReactNativeGrabContextProviderProps } from "./grab-context";
export type { ReactNativeGrabRootProps } from "./grab-root";
export type { ReactNativeGrabScreenProps } from "./grab-screen";
export type { ReactNativeGrabModalProps } from "./grab-modal";
export type {
  ReactNativeGrabContextProviderProps,
  ReactNativeGrabContextValue,
} from "./grab-context";
export declare const ReactNativeGrabRoot: React.ComponentType<ReactNativeGrabRootProps>;
export declare const ReactNativeGrabScreen: React.ComponentType<ReactNativeGrabScreenProps>;
export declare const ReactNativeGrabModal: React.ComponentType<ReactNativeGrabModalProps>;
export declare const ReactNativeGrabContextProvider: React.ComponentType<ReactNativeGrabContextProviderProps>;
export declare const enableGrabbing: () => void;
export declare const toggleGrabFreeze: () => void;
export declare const setFocusEffect: (impl: (cb: () => void) => void) => void;
export declare const patchAllModals: () => void;
//# sourceMappingURL=index.d.ts.map

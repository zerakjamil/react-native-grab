import { type ReactNativeElement } from "react-native";
import type { ReactNativeShadowNode } from "./types";
export type GrabSelectionOwnerKind = "root" | "screen" | "modal";
export type GrabSelectionOwner = {
    id: string;
    kind: GrabSelectionOwnerKind;
    shadowNode: ReactNativeShadowNode;
    registrationOrder: number;
};
type SelectionOwnersStoreSnapshot = {
    owners: Map<string, GrabSelectionOwner>;
    focusedOwnerIds: string[];
};
export declare const createGrabSelectionOwnerId: (kind: GrabSelectionOwnerKind) => string;
export declare const registerGrabSelectionOwner: (id: string, kind: GrabSelectionOwnerKind, ref: ReactNativeElement) => void;
export declare const unregisterGrabSelectionOwner: (id: string) => void;
export declare const setGrabSelectionOwnerFocused: (id: string, isFocused: boolean) => void;
export declare const clearGrabSelectionOwnerFocus: (id: string) => void;
export declare const getGrabSelectionOwner: (id: string) => GrabSelectionOwner | null;
export declare const getResolvedGrabSelectionOwner: () => GrabSelectionOwner | null;
export declare const getResolvedGrabSelectionOwnerId: () => string | null;
export declare const useResolvedGrabSelectionOwnerId: () => string | null;
export declare const useIsResolvedGrabSelectionOwner: (id: string) => boolean;
export declare const useSelectionOwnersStore: () => SelectionOwnersStoreSnapshot;
export {};
//# sourceMappingURL=containers.d.ts.map
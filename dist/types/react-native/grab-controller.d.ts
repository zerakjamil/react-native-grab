import { type GrabFreezeSnapshot } from "./freeze";
type LocalGrabSelectionController = {
    closeSelectionMenu: () => void;
    startSelection: () => void;
    stopSelection: () => void;
};
type GrabControllerState = {
    isMenuVisible: boolean;
    selectedOwnerId: string | null;
    selectionSessionOwnerId: string | null;
    freeze: {
        isActive: boolean;
        isCapturing: boolean;
        snapshot: GrabFreezeSnapshot | null;
        error: string | null;
    };
};
export declare const registerLocalGrabSelectionController: (ownerId: string, controller: LocalGrabSelectionController) => void;
export declare const unregisterLocalGrabSelectionController: (ownerId: string) => void;
export declare const useGrabControllerState: () => GrabControllerState;
export declare const setGrabSelectionSessionOwner: (ownerId: string | null) => void;
export declare const showGrabSelectionMenu: (ownerId: string) => void;
export declare const hideGrabSelectionMenu: (ownerId: string) => void;
export declare const clearGrabOwnerPresentation: (ownerId: string) => void;
export declare const enableGrabbing: () => void;
export declare const toggleGrabMenu: () => void;
export declare const startGrabFreeze: () => Promise<void>;
export declare const stopGrabFreeze: () => void;
export declare const toggleGrabFreeze: () => void;
export {};
//# sourceMappingURL=grab-controller.d.ts.map
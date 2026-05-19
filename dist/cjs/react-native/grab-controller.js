"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleGrabFreeze = exports.stopGrabFreeze = exports.startGrabFreeze = exports.toggleGrabMenu = exports.enableGrabbing = exports.clearGrabOwnerPresentation = exports.hideGrabSelectionMenu = exports.showGrabSelectionMenu = exports.setGrabSelectionSessionOwner = exports.useGrabControllerState = exports.unregisterLocalGrabSelectionController = exports.registerLocalGrabSelectionController = void 0;
const react_1 = require("react");
const containers_1 = require("./containers");
const freeze_1 = require("./freeze");
const localControllers = new Map();
const listeners = new Set();
let state = {
    isMenuVisible: false,
    selectedOwnerId: null,
    selectionSessionOwnerId: null,
    freeze: {
        isActive: false,
        isCapturing: false,
        snapshot: null,
        error: null,
    },
};
const notify = () => {
    for (const listener of listeners) {
        listener();
    }
};
const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};
const setState = (updater) => {
    state = typeof updater === "function" ? updater(state) : updater;
    notify();
};
const stopAllSelections = () => {
    for (const controller of localControllers.values()) {
        controller.stopSelection();
        controller.closeSelectionMenu();
    }
};
const registerLocalGrabSelectionController = (ownerId, controller) => {
    localControllers.set(ownerId, controller);
};
exports.registerLocalGrabSelectionController = registerLocalGrabSelectionController;
const unregisterLocalGrabSelectionController = (ownerId) => {
    localControllers.delete(ownerId);
    setState((prevState) => ({
        ...prevState,
        selectedOwnerId: prevState.selectedOwnerId === ownerId ? null : prevState.selectedOwnerId,
        selectionSessionOwnerId: prevState.selectionSessionOwnerId === ownerId ? null : prevState.selectionSessionOwnerId,
    }));
};
exports.unregisterLocalGrabSelectionController = unregisterLocalGrabSelectionController;
const useGrabControllerState = () => {
    return (0, react_1.useSyncExternalStore)(subscribe, () => state, () => state);
};
exports.useGrabControllerState = useGrabControllerState;
const setGrabSelectionSessionOwner = (ownerId) => {
    setState((prevState) => ({
        ...prevState,
        selectionSessionOwnerId: ownerId,
    }));
};
exports.setGrabSelectionSessionOwner = setGrabSelectionSessionOwner;
const showGrabSelectionMenu = (ownerId) => {
    setState((prevState) => ({
        ...prevState,
        selectedOwnerId: ownerId,
        selectionSessionOwnerId: prevState.selectionSessionOwnerId === ownerId ? null : prevState.selectionSessionOwnerId,
    }));
};
exports.showGrabSelectionMenu = showGrabSelectionMenu;
const hideGrabSelectionMenu = (ownerId) => {
    setState((prevState) => ({
        ...prevState,
        selectedOwnerId: prevState.selectedOwnerId === ownerId ? null : prevState.selectedOwnerId,
    }));
};
exports.hideGrabSelectionMenu = hideGrabSelectionMenu;
const clearGrabOwnerPresentation = (ownerId) => {
    setState((prevState) => ({
        ...prevState,
        selectedOwnerId: prevState.selectedOwnerId === ownerId ? null : prevState.selectedOwnerId,
        selectionSessionOwnerId: prevState.selectionSessionOwnerId === ownerId ? null : prevState.selectionSessionOwnerId,
    }));
};
exports.clearGrabOwnerPresentation = clearGrabOwnerPresentation;
const enableGrabbing = () => {
    const ownerId = (0, containers_1.getResolvedGrabSelectionOwnerId)();
    if (!ownerId) {
        console.error("[react-native-grab] Cannot enable grabbing. Ensure ReactNativeGrabRoot is mounted.");
        return;
    }
    const controller = localControllers.get(ownerId);
    if (!controller) {
        console.error("[react-native-grab] Cannot enable grabbing. Ensure the focused ReactNativeGrabScreen is mounted.");
        return;
    }
    stopAllSelections();
    setState((prevState) => ({
        ...prevState,
        selectedOwnerId: null,
        selectionSessionOwnerId: ownerId,
    }));
    controller.startSelection();
};
exports.enableGrabbing = enableGrabbing;
const toggleGrabMenu = () => {
    setState((prevState) => {
        const isVisible = !prevState.isMenuVisible;
        if (!isVisible) {
            stopAllSelections();
            return {
                ...prevState,
                isMenuVisible: false,
                selectedOwnerId: null,
                selectionSessionOwnerId: null,
                freeze: {
                    isActive: false,
                    isCapturing: false,
                    snapshot: null,
                    error: null,
                },
            };
        }
        return {
            ...prevState,
            isMenuVisible: true,
        };
    });
};
exports.toggleGrabMenu = toggleGrabMenu;
const startGrabFreeze = async () => {
    if (state.freeze.isCapturing) {
        return;
    }
    setState((prevState) => ({
        ...prevState,
        freeze: {
            ...prevState.freeze,
            isCapturing: true,
            error: null,
        },
    }));
    try {
        const snapshot = await (0, freeze_1.captureGrabFreezeSnapshot)();
        setState((prevState) => ({
            ...prevState,
            freeze: {
                isActive: true,
                isCapturing: false,
                snapshot,
                error: null,
            },
        }));
        (0, exports.enableGrabbing)();
    }
    catch (error) {
        console.error("[react-native-grab] Freeze capture failed. Ensure react-native-view-shot is installed.");
        setState((prevState) => ({
            ...prevState,
            freeze: {
                ...prevState.freeze,
                isCapturing: false,
                error: error instanceof Error ? error.message : "Freeze capture failed",
            },
        }));
    }
};
exports.startGrabFreeze = startGrabFreeze;
const stopGrabFreeze = () => {
    stopAllSelections();
    setState((prevState) => ({
        ...prevState,
        selectedOwnerId: null,
        selectionSessionOwnerId: null,
        freeze: {
            isActive: false,
            isCapturing: false,
            snapshot: null,
            error: null,
        },
    }));
};
exports.stopGrabFreeze = stopGrabFreeze;
const toggleGrabFreeze = () => {
    if (state.freeze.isCapturing) {
        return;
    }
    if (state.freeze.isActive) {
        (0, exports.stopGrabFreeze)();
        return;
    }
    void (0, exports.startGrabFreeze)();
};
exports.toggleGrabFreeze = toggleGrabFreeze;
//# sourceMappingURL=grab-controller.js.map
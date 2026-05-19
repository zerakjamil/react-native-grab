import { useSyncExternalStore } from "react";
import { getResolvedGrabSelectionOwnerId } from "./containers";
import { captureGrabFreezeSnapshot } from "./freeze";
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
export const registerLocalGrabSelectionController = (ownerId, controller) => {
  localControllers.set(ownerId, controller);
};
export const unregisterLocalGrabSelectionController = (ownerId) => {
  localControllers.delete(ownerId);
  setState((prevState) => ({
    ...prevState,
    selectedOwnerId: prevState.selectedOwnerId === ownerId ? null : prevState.selectedOwnerId,
    selectionSessionOwnerId:
      prevState.selectionSessionOwnerId === ownerId ? null : prevState.selectionSessionOwnerId,
  }));
};
export const useGrabControllerState = () => {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
};
export const setGrabSelectionSessionOwner = (ownerId) => {
  setState((prevState) => ({
    ...prevState,
    selectionSessionOwnerId: ownerId,
  }));
};
export const showGrabSelectionMenu = (ownerId) => {
  setState((prevState) => ({
    ...prevState,
    selectedOwnerId: ownerId,
    selectionSessionOwnerId:
      prevState.selectionSessionOwnerId === ownerId ? null : prevState.selectionSessionOwnerId,
  }));
};
export const hideGrabSelectionMenu = (ownerId) => {
  setState((prevState) => ({
    ...prevState,
    selectedOwnerId: prevState.selectedOwnerId === ownerId ? null : prevState.selectedOwnerId,
  }));
};
export const clearGrabOwnerPresentation = (ownerId) => {
  setState((prevState) => ({
    ...prevState,
    selectedOwnerId: prevState.selectedOwnerId === ownerId ? null : prevState.selectedOwnerId,
    selectionSessionOwnerId:
      prevState.selectionSessionOwnerId === ownerId ? null : prevState.selectionSessionOwnerId,
  }));
};
export const enableGrabbing = () => {
  const ownerId = getResolvedGrabSelectionOwnerId();
  if (!ownerId) {
    console.error(
      "[react-native-grab] Cannot enable grabbing. Ensure ReactNativeGrabRoot is mounted.",
    );
    return;
  }
  const controller = localControllers.get(ownerId);
  if (!controller) {
    console.error(
      "[react-native-grab] Cannot enable grabbing. Ensure the focused ReactNativeGrabScreen is mounted.",
    );
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
export const toggleGrabMenu = () => {
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
export const startGrabFreeze = async () => {
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
    const snapshot = await captureGrabFreezeSnapshot();
    setState((prevState) => ({
      ...prevState,
      freeze: {
        isActive: true,
        isCapturing: false,
        snapshot,
        error: null,
      },
    }));
    enableGrabbing();
  } catch (error) {
    console.error(
      "[react-native-grab] Freeze capture failed. Ensure react-native-view-shot is installed.",
    );
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
export const stopGrabFreeze = () => {
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
export const toggleGrabFreeze = () => {
  if (state.freeze.isCapturing) {
    return;
  }
  if (state.freeze.isActive) {
    stopGrabFreeze();
    return;
  }
  void startGrabFreeze();
};
//# sourceMappingURL=grab-controller.js.map

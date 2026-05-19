import { useSyncExternalStore } from "react";
import { findNodeHandle } from "react-native";
import { getFabricUIManager } from "./fabric";
let ownerIdCounter = 0;
let registrationOrder = 0;
let focusedOwnerIds = [];
const owners = new Map();
const listeners = new Set();
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
const getSnapshot = () => ({
    owners: new Map(owners),
    focusedOwnerIds,
});
const getOwnerShadowNode = (ref, errorMessage) => {
    // @ts-expect-error - findNodeHandle is not typed correctly
    const nativeTag = findNodeHandle(ref);
    if (!nativeTag) {
        throw new Error(errorMessage);
    }
    return getFabricUIManager().findShadowNodeByTag_DEPRECATED(nativeTag);
};
const getFallbackRootOwner = () => {
    const rootOwners = Array.from(owners.values()).filter((owner) => owner.kind === "root");
    rootOwners.sort((left, right) => right.registrationOrder - left.registrationOrder);
    return rootOwners[0] ?? null;
};
export const createGrabSelectionOwnerId = (kind) => {
    ownerIdCounter += 1;
    return `react-native-grab-${kind}-${ownerIdCounter}`;
};
export const registerGrabSelectionOwner = (id, kind, ref) => {
    const shadowNode = getOwnerShadowNode(ref, kind === "root"
        ? "Failed to find native tag for app root"
        : "Failed to find native tag for screen");
    registrationOrder += 1;
    owners.set(id, {
        id,
        kind,
        shadowNode,
        registrationOrder,
    });
    notify();
};
export const unregisterGrabSelectionOwner = (id) => {
    const removedOwner = owners.get(id);
    if (!removedOwner) {
        return;
    }
    owners.delete(id);
    focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
    notify();
};
export const setGrabSelectionOwnerFocused = (id, isFocused) => {
    const owner = owners.get(id);
    if (!owner || (owner.kind !== "screen" && owner.kind !== "modal")) {
        return;
    }
    if (isFocused) {
        if (!focusedOwnerIds.includes(id)) {
            focusedOwnerIds.push(id);
        }
    }
    else {
        focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
    }
    notify();
};
export const clearGrabSelectionOwnerFocus = (id) => {
    focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
    notify();
};
export const getGrabSelectionOwner = (id) => {
    return owners.get(id) ?? null;
};
export const getResolvedGrabSelectionOwner = () => {
    for (let i = focusedOwnerIds.length - 1; i >= 0; i--) {
        const focusedOwner = owners.get(focusedOwnerIds[i]);
        if (focusedOwner) {
            return focusedOwner;
        }
    }
    return getFallbackRootOwner();
};
export const getResolvedGrabSelectionOwnerId = () => {
    return getResolvedGrabSelectionOwner()?.id ?? null;
};
export const useResolvedGrabSelectionOwnerId = () => {
    return useSyncExternalStore(subscribe, () => getResolvedGrabSelectionOwnerId(), () => null);
};
export const useIsResolvedGrabSelectionOwner = (id) => {
    return useSyncExternalStore(subscribe, () => getResolvedGrabSelectionOwnerId() === id, () => false);
};
export const useSelectionOwnersStore = () => {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
//# sourceMappingURL=containers.js.map
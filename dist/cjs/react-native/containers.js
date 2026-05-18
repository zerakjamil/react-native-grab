"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelectionOwnersStore = exports.useIsResolvedGrabSelectionOwner = exports.useResolvedGrabSelectionOwnerId = exports.getResolvedGrabSelectionOwnerId = exports.getResolvedGrabSelectionOwner = exports.getGrabSelectionOwner = exports.clearGrabSelectionOwnerFocus = exports.setGrabSelectionOwnerFocused = exports.unregisterGrabSelectionOwner = exports.registerGrabSelectionOwner = exports.createGrabSelectionOwnerId = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const fabric_1 = require("./fabric");
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
    const nativeTag = (0, react_native_1.findNodeHandle)(ref);
    if (!nativeTag) {
        throw new Error(errorMessage);
    }
    return (0, fabric_1.getFabricUIManager)().findShadowNodeByTag_DEPRECATED(nativeTag);
};
const getFallbackRootOwner = () => {
    const rootOwners = Array.from(owners.values()).filter((owner) => owner.kind === "root");
    rootOwners.sort((left, right) => right.registrationOrder - left.registrationOrder);
    return rootOwners[0] ?? null;
};
const createGrabSelectionOwnerId = (kind) => {
    ownerIdCounter += 1;
    return `react-native-grab-${kind}-${ownerIdCounter}`;
};
exports.createGrabSelectionOwnerId = createGrabSelectionOwnerId;
const registerGrabSelectionOwner = (id, kind, ref) => {
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
exports.registerGrabSelectionOwner = registerGrabSelectionOwner;
const unregisterGrabSelectionOwner = (id) => {
    const removedOwner = owners.get(id);
    if (!removedOwner) {
        return;
    }
    owners.delete(id);
    focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
    notify();
};
exports.unregisterGrabSelectionOwner = unregisterGrabSelectionOwner;
const setGrabSelectionOwnerFocused = (id, isFocused) => {
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
exports.setGrabSelectionOwnerFocused = setGrabSelectionOwnerFocused;
const clearGrabSelectionOwnerFocus = (id) => {
    focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
    notify();
};
exports.clearGrabSelectionOwnerFocus = clearGrabSelectionOwnerFocus;
const getGrabSelectionOwner = (id) => {
    return owners.get(id) ?? null;
};
exports.getGrabSelectionOwner = getGrabSelectionOwner;
const getResolvedGrabSelectionOwner = () => {
    for (let i = focusedOwnerIds.length - 1; i >= 0; i--) {
        const focusedOwner = owners.get(focusedOwnerIds[i]);
        if (focusedOwner) {
            return focusedOwner;
        }
    }
    return getFallbackRootOwner();
};
exports.getResolvedGrabSelectionOwner = getResolvedGrabSelectionOwner;
const getResolvedGrabSelectionOwnerId = () => {
    return (0, exports.getResolvedGrabSelectionOwner)()?.id ?? null;
};
exports.getResolvedGrabSelectionOwnerId = getResolvedGrabSelectionOwnerId;
const useResolvedGrabSelectionOwnerId = () => {
    return (0, react_1.useSyncExternalStore)(subscribe, () => (0, exports.getResolvedGrabSelectionOwnerId)(), () => null);
};
exports.useResolvedGrabSelectionOwnerId = useResolvedGrabSelectionOwnerId;
const useIsResolvedGrabSelectionOwner = (id) => {
    return (0, react_1.useSyncExternalStore)(subscribe, () => (0, exports.getResolvedGrabSelectionOwnerId)() === id, () => false);
};
exports.useIsResolvedGrabSelectionOwner = useIsResolvedGrabSelectionOwner;
const useSelectionOwnersStore = () => {
    return (0, react_1.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
};
exports.useSelectionOwnersStore = useSelectionOwnersStore;
//# sourceMappingURL=containers.js.map
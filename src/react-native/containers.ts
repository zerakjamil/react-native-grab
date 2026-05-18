import { useSyncExternalStore } from "react";
import { findNodeHandle, type ReactNativeElement } from "react-native";
import type { ReactNativeShadowNode } from "./types";
import { getFabricUIManager } from "./fabric";

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

let ownerIdCounter = 0;
let registrationOrder = 0;
let focusedOwnerIds: string[] = [];
const owners = new Map<string, GrabSelectionOwner>();
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): SelectionOwnersStoreSnapshot => ({
  owners: new Map(owners),
  focusedOwnerIds,
});

const getOwnerShadowNode = (ref: ReactNativeElement, errorMessage: string) => {
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

export const createGrabSelectionOwnerId = (kind: GrabSelectionOwnerKind) => {
  ownerIdCounter += 1;
  return `react-native-grab-${kind}-${ownerIdCounter}`;
};

export const registerGrabSelectionOwner = (
  id: string,
  kind: GrabSelectionOwnerKind,
  ref: ReactNativeElement,
) => {
  const shadowNode = getOwnerShadowNode(
    ref,
    kind === "root"
      ? "Failed to find native tag for app root"
      : "Failed to find native tag for screen",
  );

  registrationOrder += 1;
  owners.set(id, {
    id,
    kind,
    shadowNode,
    registrationOrder,
  });
  notify();
};

export const unregisterGrabSelectionOwner = (id: string) => {
  const removedOwner = owners.get(id);
  if (!removedOwner) {
    return;
  }

  owners.delete(id);
  focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);

  notify();
};

export const setGrabSelectionOwnerFocused = (id: string, isFocused: boolean) => {
  const owner = owners.get(id);
  if (!owner || (owner.kind !== "screen" && owner.kind !== "modal")) {
    return;
  }

  if (isFocused) {
    if (!focusedOwnerIds.includes(id)) {
      focusedOwnerIds.push(id);
    }
  } else {
    focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
  }

  notify();
};

export const clearGrabSelectionOwnerFocus = (id: string) => {
  focusedOwnerIds = focusedOwnerIds.filter((ownerId) => ownerId !== id);
  notify();
};

export const getGrabSelectionOwner = (id: string): GrabSelectionOwner | null => {
  return owners.get(id) ?? null;
};

export const getResolvedGrabSelectionOwner = (): GrabSelectionOwner | null => {
  for (let i = focusedOwnerIds.length - 1; i >= 0; i--) {
    const focusedOwner = owners.get(focusedOwnerIds[i]);
    if (focusedOwner) {
      return focusedOwner;
    }
  }

  return getFallbackRootOwner();
};

export const getResolvedGrabSelectionOwnerId = (): string | null => {
  return getResolvedGrabSelectionOwner()?.id ?? null;
};

export const useResolvedGrabSelectionOwnerId = () => {
  return useSyncExternalStore(
    subscribe,
    () => getResolvedGrabSelectionOwnerId(),
    () => null,
  );
};

export const useIsResolvedGrabSelectionOwner = (id: string) => {
  return useSyncExternalStore(
    subscribe,
    () => getResolvedGrabSelectionOwnerId() === id,
    () => false,
  );
};

export const useSelectionOwnersStore = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

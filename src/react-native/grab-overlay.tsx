import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  NativeTouchEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderHandlers,
} from "react-native";
import { getGrabSelectionOwner, useIsResolvedGrabSelectionOwner } from "./containers";
import { copyViaMetro } from "./copy";
import { ContextMenu } from "./context-menu";
import { GRAB_BADGE_BACKGROUND, GRAB_HIGHLIGHT_FILL, GRAB_PRIMARY } from "./grab-colors";
import {
  clearGrabOwnerPresentation,
  hideGrabSelectionMenu,
  registerLocalGrabSelectionController,
  setGrabSelectionSessionOwner,
  showGrabSelectionMenu,
  stopGrabFreeze,
  unregisterLocalGrabSelectionController,
  useGrabControllerState,
} from "./grab-controller";
import { getDescription, getGrabSelectionTitle } from "./description";
import { getRenderedBy, type RenderedByFrame } from "./get-rendered-by";
import { findNodeAtPoint, measureInWindow } from "./measure";
import { openStackFrameInEditor } from "./open";
import { buildComponentPathLabel, getSerializedProps } from "./props";
import type { BoundingClientRect, ReactNativeFiberNode } from "./types";

type GrabResult = {
  fiberNode: ReactNativeFiberNode;
  rect: BoundingClientRect;
};

type SelectedGrabResult = {
  description: string;
  elementName: string;
  frame: RenderedByFrame | null;
  result: GrabResult;
};

const COPY_BADGE_DURATION_MS = 1600;

export type ReactNativeGrabOverlayProps = {
  ownerId: string;
  onPanHandlersChange?: (panHandlers: GestureResponderHandlers | null) => void;
};

export const ReactNativeGrabOverlay = ({
  ownerId,
  onPanHandlersChange,
}: ReactNativeGrabOverlayProps) => {
  const isResolvedSelectionOwner = useIsResolvedGrabSelectionOwner(ownerId);
  const grabControllerState = useGrabControllerState();
  const freezeState = grabControllerState.freeze;
  const copyBadgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [state, setState] = useState({
    isSessionEnabled: false,
    grabbedElement: null as GrabResult | null,
    isCopyBadgeVisible: false,
    selectedElement: null as SelectedGrabResult | null,
  });
  const [showLayoutMetrics, setShowLayoutMetrics] = useState(false);

  const startSession = useCallback((options?: { preserveSelection?: boolean }) => {
    setState((prev) => ({
      ...prev,
      grabbedElement: null,
      isSessionEnabled: true,
      selectedElement: options?.preserveSelection ? prev.selectedElement : null,
    }));
  }, []);

  const stopSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSessionEnabled: false,
      grabbedElement: null,
    }));
  }, []);

  const closeSelectedElementMenu = useCallback(() => {
    hideGrabSelectionMenu(ownerId);
    setShowLayoutMetrics(false);
    setState((prev) => {
      return {
        ...prev,
        selectedElement: null,
        grabbedElement: null,
      };
    });
  }, [ownerId]);

  useEffect(() => {
    return () => {
      if (copyBadgeTimeoutRef.current) {
        clearTimeout(copyBadgeTimeoutRef.current);
      }
    };
  }, []);

  const updateGrabbedElement = useCallback((grabbedElement: GrabResult | null) => {
    setState((prev) => ({
      ...prev,
      grabbedElement,
    }));
  }, []);

  const showCopiedBadge = useCallback(() => {
    if (copyBadgeTimeoutRef.current) {
      clearTimeout(copyBadgeTimeoutRef.current);
    }

    setState((prev) => ({ ...prev, isCopyBadgeVisible: true }));

    copyBadgeTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isCopyBadgeVisible: false }));
      copyBadgeTimeoutRef.current = null;
    }, COPY_BADGE_DURATION_MS);
  }, []);

  useEffect(() => {
    if (isResolvedSelectionOwner) {
      return;
    }

    clearGrabOwnerPresentation(ownerId);
    setState((prev) => {
      if (!prev.isSessionEnabled && !prev.grabbedElement && !prev.selectedElement) {
        return prev;
      }

      return {
        ...prev,
        isSessionEnabled: false,
        grabbedElement: null,
        selectedElement: null,
      };
    });
  }, [isResolvedSelectionOwner, ownerId]);

  const getElementAtPoint = useCallback(
    (
      pageX: number,
      pageY: number,
    ): { fiberNode: ReactNativeFiberNode; rect: BoundingClientRect } | null => {
      const owner = getGrabSelectionOwner(ownerId);
      if (!owner) {
        return null;
      }

      const ownerRect = measureInWindow(owner.shadowNode);
      const localX = pageX - ownerRect[0];
      const localY = pageY - ownerRect[1];

      const internalNode = findNodeAtPoint(owner.shadowNode, localX, localY);
      const shadowNode = internalNode?.stateNode?.node;

      if (!shadowNode) {
        return null;
      }

      const rect = nativeFabricUIManager.getBoundingClientRect(shadowNode, true);
      return {
        fiberNode: internalNode,
        rect: [rect[0] - ownerRect[0], rect[1] - ownerRect[1], rect[2], rect[3]],
      };
    },
    [ownerId],
  );

  const freezeStateRef = useRef(grabControllerState.freeze);
  const selectedElementRef = useRef(state.selectedElement);

  useEffect(() => {
    freezeStateRef.current = grabControllerState.freeze;
  }, [grabControllerState.freeze]);

  useEffect(() => {
    selectedElementRef.current = state.selectedElement;
  }, [state.selectedElement]);

  const handleTouch = (nativeEvent: NativeTouchEvent) => {
    const result = getElementAtPoint(nativeEvent.pageX, nativeEvent.pageY);

    if (!result) {
      updateGrabbedElement(null);
      return null;
    }

    updateGrabbedElement(result);
  };

  const handleGrabbing = useCallback(
    async (result: GrabResult): Promise<void> => {
      const [description, renderedBy] = await Promise.all([
        getDescription(result.fiberNode),
        getRenderedBy(result.fiberNode),
      ]);

      const firstFrame = renderedBy.find((frame) => Boolean(frame.file)) ?? null;
      const elementName = getGrabSelectionTitle(result.fiberNode, renderedBy);

      setState((prev) => ({
        ...prev,
        grabbedElement: result,
        selectedElement: {
          description,
          elementName,
          frame: firstFrame,
          result,
        },
      }));
      showGrabSelectionMenu(ownerId);
    },
    [ownerId],
  );

  useEffect(() => {
    registerLocalGrabSelectionController(ownerId, {
      closeSelectionMenu: () => {
        closeSelectedElementMenu();
      },
      startSelection: startSession,
      stopSelection: () => {
        closeSelectedElementMenu();
        stopSession();
      },
    });

    return () => {
      unregisterLocalGrabSelectionController(ownerId);
    };
  }, [closeSelectedElementMenu, ownerId, startSession, stopSession]);

  useEffect(() => {
    if (!freezeState.isActive) {
      return;
    }

    if (
      grabControllerState.selectionSessionOwnerId &&
      grabControllerState.selectionSessionOwnerId !== ownerId
    ) {
      return;
    }

    if (grabControllerState.selectionSessionOwnerId !== ownerId) {
      setGrabSelectionSessionOwner(ownerId);
    }

    if (!state.isSessionEnabled) {
      startSession({ preserveSelection: state.selectedElement !== null });
    }
  }, [
    freezeState.isActive,
    grabControllerState.selectionSessionOwnerId,
    grabControllerState.selectedOwnerId,
    ownerId,
    startSession,
    state.isSessionEnabled,
    state.selectedElement,
  ]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent),
      onPanResponderMove: (evt) => handleTouch(evt.nativeEvent),
      onPanResponderRelease: (evt) => {
        void (async () => {
          try {
            const result = getElementAtPoint(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
            if (!result) {
              if (freezeStateRef.current.isActive && selectedElementRef.current !== null) {
                closeSelectedElementMenu();
              }
              return;
            }

            await handleGrabbing(result);
          } catch {
            console.error("[react-native-grab] Grabbing failed.");
          } finally {
            setGrabSelectionSessionOwner(null);
            stopSession();
          }
        })();
      },
    }),
  ).current;

  useEffect(() => {
    const isMenuOpen = state.selectedElement !== null;
    const isPanEnabled = state.isSessionEnabled && !isMenuOpen;
    const isFreezeBlocking = freezeState.isActive || freezeState.isCapturing;
    const shouldAttachToParent = isPanEnabled && !isFreezeBlocking;

    onPanHandlersChange?.(shouldAttachToParent ? panResponder.panHandlers : null);
    return () => {
      onPanHandlersChange?.(null);
    };
  }, [
    freezeState.isActive,
    freezeState.isCapturing,
    onPanHandlersChange,
    panResponder.panHandlers,
    state.isSessionEnabled,
    state.selectedElement,
  ]);

  const handleCopySelectedElement = useCallback(async () => {
    const selectedElement = state.selectedElement;

    if (!selectedElement) {
      return;
    }

    closeSelectedElementMenu();

    try {
      await copyViaMetro(selectedElement.description);
      showCopiedBadge();
    } catch {
      console.error(
        "[react-native-grab] Copying failed. Ensure your Metro config is wrapped with withReactNativeGrab(...) and Metro has been restarted.",
      );
    }
  }, [closeSelectedElementMenu, showCopiedBadge, state.selectedElement]);

  const handleOpenSelectedElement = useCallback(async () => {
    const frame = state.selectedElement?.frame;

    if (!frame?.file || frame.line == null) {
      return;
    }

    closeSelectedElementMenu();

    try {
      await openStackFrameInEditor({
        file: frame.file,
        lineNumber: frame.line,
      });
    } catch {
      console.error("[react-native-grab] Opening editor failed.");
    }
  }, [closeSelectedElementMenu, state.selectedElement]);

  const handleCopyElementPath = useCallback(async () => {
    const selectedElement = state.selectedElement;

    if (!selectedElement) {
      return;
    }

    const label = buildComponentPathLabel(selectedElement.elementName, selectedElement.frame);
    closeSelectedElementMenu();

    try {
      await copyViaMetro(label);
      showCopiedBadge();
    } catch {
      console.error(
        "[react-native-grab] Copying failed. Ensure your Metro config is wrapped with withReactNativeGrab(...) and Metro has been restarted.",
      );
    }
  }, [closeSelectedElementMenu, showCopiedBadge, state.selectedElement]);

  const handleCopyProps = useCallback(async () => {
    const selectedElement = state.selectedElement;

    if (!selectedElement) {
      return;
    }

    const propsText = getSerializedProps(selectedElement.result.fiberNode);
    if (!propsText) {
      return;
    }

    closeSelectedElementMenu();

    try {
      await copyViaMetro(propsText);
      showCopiedBadge();
    } catch {
      console.error(
        "[react-native-grab] Copying failed. Ensure your Metro config is wrapped with withReactNativeGrab(...) and Metro has been restarted.",
      );
    }
  }, [closeSelectedElementMenu, showCopiedBadge, state.selectedElement]);

  const handleToggleLayoutMetrics = useCallback(() => {
    setShowLayoutMetrics((prev) => !prev);
  }, []);

  const handleUnfreeze = useCallback(() => {
    stopGrabFreeze();
    closeSelectedElementMenu();
  }, [closeSelectedElementMenu]);

  const selectedElementMenuAnchor = useMemo(() => {
    if (!state.selectedElement) {
      return null;
    }

    const rect = state.selectedElement.result.rect;
    return {
      x: rect[0] + rect[2] / 2,
      y: rect[1] + rect[3],
    };
  }, [state.selectedElement]);

  const highlightedElement = state.grabbedElement ?? state.selectedElement?.result ?? null;

  const statusBadgeText = useMemo(() => {
    if (state.isCopyBadgeVisible) return "Element copied";
    if (freezeState.isCapturing) return "Freezing screen...";
    if (freezeState.error) return "Freeze failed";
    if (freezeState.isActive) return "Frozen";
    if (state.isSessionEnabled) return "Touch and move around to grab";
    return null;
  }, [
    freezeState.error,
    freezeState.isActive,
    freezeState.isCapturing,
    state.isCopyBadgeVisible,
    state.isSessionEnabled,
  ]);

  const layoutMetrics = useMemo(() => {
    if (!state.selectedElement) {
      return null;
    }

    const rect = state.selectedElement.result.rect;
    return {
      x: Math.round(rect[0]),
      y: Math.round(rect[1]),
      width: Math.round(rect[2]),
      height: Math.round(rect[3]),
    };
  }, [state.selectedElement]);

  const isMenuOpen = state.selectedElement !== null;
  const isFreezeBlocking = freezeState.isActive || freezeState.isCapturing;
  const isPanEnabled = state.isSessionEnabled && !isMenuOpen;
  const shouldBlockTouchesInOverlay = isFreezeBlocking && !isMenuOpen;
  const overlayPointerEvents = isFreezeBlocking ? "auto" : "box-none";
  const overlayTouchHandlers = shouldBlockTouchesInOverlay
    ? isPanEnabled
      ? panResponder.panHandlers
      : {
          onStartShouldSetResponderCapture: () => true,
          onResponderRelease: () => {},
        }
    : null;

  if (
    !state.isSessionEnabled &&
    !state.isCopyBadgeVisible &&
    !state.grabbedElement &&
    !state.selectedElement &&
    !freezeState.isActive &&
    !freezeState.isCapturing &&
    !freezeState.error
  ) {
    return null;
  }

  return (
    <View
      pointerEvents={overlayPointerEvents}
      style={styles.overlayRoot}
      {...(overlayTouchHandlers ?? {})}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBounds((prev) => {
          if (prev.width === width && prev.height === height) {
            return prev;
          }

          return { width, height };
        });
      }}
    >
      {freezeState.isActive && freezeState.snapshot?.uri && (
        <View pointerEvents="none" style={styles.freezeImageWrap}>
          <Image
            resizeMode="cover"
            source={{ uri: freezeState.snapshot.uri }}
            style={styles.freezeImage}
          />
        </View>
      )}

      {statusBadgeText && (
        <View
          pointerEvents="none"
          style={[styles.topBadge, freezeState.error && styles.topBadgeError]}
        >
          <Text style={styles.topBadgeText}>{statusBadgeText}</Text>
        </View>
      )}

      {!!highlightedElement && (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              left: highlightedElement.rect[0],
              top: highlightedElement.rect[1],
              width: highlightedElement.rect[2],
              height: highlightedElement.rect[3],
            },
          ]}
        />
      )}

      {showLayoutMetrics && layoutMetrics && (
        <View
          pointerEvents="none"
          style={[
            styles.metricsBadge,
            {
              left: Math.min(Math.max(8, layoutMetrics.x), Math.max(8, bounds.width - 160)),
              top: Math.max(8, layoutMetrics.y - 28),
            },
          ]}
        >
          <Text style={styles.metricsText}>
            {`x:${layoutMetrics.x} y:${layoutMetrics.y} w:${layoutMetrics.width} h:${layoutMetrics.height}`}
          </Text>
        </View>
      )}

      <ContextMenu
        anchor={selectedElementMenuAnchor}
        bounds={bounds}
        cutout={
          state.selectedElement
            ? {
                x: state.selectedElement.result.rect[0],
                y: state.selectedElement.result.rect[1],
                width: state.selectedElement.result.rect[2],
                height: state.selectedElement.result.rect[3],
              }
            : null
        }
        horizontalAlignment="center"
        offset={{ x: 0, y: 8 }}
        onClose={closeSelectedElementMenu}
        visible={state.selectedElement !== null}
      >
        <View style={styles.selectionMenuHeader}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={1}
            style={styles.selectionMenuTitle}
          >
            {state.selectedElement?.elementName}
          </Text>
        </View>
        <ContextMenu.Item onPress={() => void handleCopySelectedElement()}>
          Copy summary
        </ContextMenu.Item>
        <ContextMenu.Item onPress={() => void handleCopyElementPath()}>
          Copy name + path
        </ContextMenu.Item>
        <ContextMenu.Item onPress={() => void handleCopyProps()}>Copy props JSON</ContextMenu.Item>
        <ContextMenu.Item onPress={handleToggleLayoutMetrics}>
          {showLayoutMetrics ? "Hide layout metrics" : "Show layout metrics"}
        </ContextMenu.Item>
        <ContextMenu.Item
          disabled={!state.selectedElement?.frame?.file}
          onPress={() => void handleOpenSelectedElement()}
        >
          Open in editor
        </ContextMenu.Item>
        {freezeState.isActive && (
          <ContextMenu.Item destructive onPress={handleUnfreeze}>
            Unfreeze
          </ContextMenu.Item>
        )}
      </ContextMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 99999,
  },
  topBadge: {
    position: "absolute",
    top: 52,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: GRAB_BADGE_BACKGROUND,
  },
  topBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  topBadgeError: {
    backgroundColor: "rgba(188, 30, 30, 0.9)",
  },
  highlight: {
    position: "absolute",
    backgroundColor: GRAB_HIGHLIGHT_FILL,
    borderWidth: 1,
    borderColor: GRAB_PRIMARY,
  },
  freezeImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  freezeImage: {
    ...StyleSheet.absoluteFillObject,
  },
  metricsBadge: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(17, 24, 39, 0.86)",
    maxWidth: 220,
  },
  metricsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  selectionMenuHeader: {
    alignSelf: "stretch",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectionMenuTitle: {
    width: "100%",
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
  },
  selectionMenuActions: {
    flexDirection: "row",
  },
  selectionMenuActionButton: {
    flex: 1,
  },
  selectionMenuActionButtonPressed: {
    backgroundColor: "rgba(17, 17, 17, 0.06)",
  },
  selectionMenuActionDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(17, 17, 17, 0.12)",
  },
  selectionMenuActionText: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111111",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  selectionMenuActionTextDisabled: {
    opacity: 0.4,
  },
});

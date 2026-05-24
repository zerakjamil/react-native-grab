"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeGrabOverlay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const containers_1 = require("./containers");
const copy_1 = require("./copy");
const context_menu_1 = require("./context-menu");
const grab_colors_1 = require("./grab-colors");
const grab_controller_1 = require("./grab-controller");
const description_1 = require("./description");
const get_rendered_by_1 = require("./get-rendered-by");
const measure_1 = require("./measure");
const open_1 = require("./open");
const props_1 = require("./props");
const COPY_BADGE_DURATION_MS = 1600;
const ReactNativeGrabOverlay = ({ ownerId, onPanHandlersChange, }) => {
    const isResolvedSelectionOwner = (0, containers_1.useIsResolvedGrabSelectionOwner)(ownerId);
    const grabControllerState = (0, grab_controller_1.useGrabControllerState)();
    const freezeState = grabControllerState.freeze;
    const copyBadgeTimeoutRef = (0, react_1.useRef)(null);
    const [bounds, setBounds] = (0, react_1.useState)({ width: 0, height: 0 });
    const [state, setState] = (0, react_1.useState)({
        isSessionEnabled: false,
        grabbedElement: null,
        isCopyBadgeVisible: false,
        selectedElement: null,
    });
    const [showLayoutMetrics, setShowLayoutMetrics] = (0, react_1.useState)(false);
    const startSession = (0, react_1.useCallback)((options) => {
        setState((prev) => ({
            ...prev,
            grabbedElement: null,
            isSessionEnabled: true,
            selectedElement: options?.preserveSelection ? prev.selectedElement : null,
        }));
    }, []);
    const stopSession = (0, react_1.useCallback)(() => {
        setState((prev) => ({
            ...prev,
            isSessionEnabled: false,
            grabbedElement: null,
        }));
    }, []);
    const closeSelectedElementMenu = (0, react_1.useCallback)(() => {
        (0, grab_controller_1.hideGrabSelectionMenu)(ownerId);
        setShowLayoutMetrics(false);
        setState((prev) => {
            return {
                ...prev,
                selectedElement: null,
                grabbedElement: null,
            };
        });
    }, [ownerId]);
    (0, react_1.useEffect)(() => {
        return () => {
            if (copyBadgeTimeoutRef.current) {
                clearTimeout(copyBadgeTimeoutRef.current);
            }
        };
    }, []);
    const updateGrabbedElement = (0, react_1.useCallback)((grabbedElement) => {
        setState((prev) => ({
            ...prev,
            grabbedElement,
        }));
    }, []);
    const showCopiedBadge = (0, react_1.useCallback)(() => {
        if (copyBadgeTimeoutRef.current) {
            clearTimeout(copyBadgeTimeoutRef.current);
        }
        setState((prev) => ({ ...prev, isCopyBadgeVisible: true }));
        copyBadgeTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, isCopyBadgeVisible: false }));
            copyBadgeTimeoutRef.current = null;
        }, COPY_BADGE_DURATION_MS);
    }, []);
    (0, react_1.useEffect)(() => {
        if (isResolvedSelectionOwner) {
            return;
        }
        (0, grab_controller_1.clearGrabOwnerPresentation)(ownerId);
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
    const getElementAtPoint = (0, react_1.useCallback)((pageX, pageY) => {
        const owner = (0, containers_1.getGrabSelectionOwner)(ownerId);
        if (!owner) {
            return null;
        }
        const ownerRect = (0, measure_1.measureInWindow)(owner.shadowNode);
        const localX = pageX - ownerRect[0];
        const localY = pageY - ownerRect[1];
        const internalNode = (0, measure_1.findNodeAtPoint)(owner.shadowNode, localX, localY);
        const shadowNode = internalNode?.stateNode?.node;
        if (!shadowNode) {
            return null;
        }
        const rect = nativeFabricUIManager.getBoundingClientRect(shadowNode, true);
        return {
            fiberNode: internalNode,
            rect: [rect[0] - ownerRect[0], rect[1] - ownerRect[1], rect[2], rect[3]],
        };
    }, [ownerId]);
    const freezeStateRef = (0, react_1.useRef)(grabControllerState.freeze);
    const selectedElementRef = (0, react_1.useRef)(state.selectedElement);
    (0, react_1.useEffect)(() => {
        freezeStateRef.current = grabControllerState.freeze;
    }, [grabControllerState.freeze]);
    (0, react_1.useEffect)(() => {
        selectedElementRef.current = state.selectedElement;
    }, [state.selectedElement]);
    const handleTouch = (nativeEvent) => {
        const result = getElementAtPoint(nativeEvent.pageX, nativeEvent.pageY);
        if (!result) {
            updateGrabbedElement(null);
            return null;
        }
        updateGrabbedElement(result);
    };
    const handleGrabbing = (0, react_1.useCallback)(async (result) => {
        const [description, renderedBy] = await Promise.all([
            (0, description_1.getDescription)(result.fiberNode),
            (0, get_rendered_by_1.getRenderedBy)(result.fiberNode),
        ]);
        const firstFrame = renderedBy.find((frame) => Boolean(frame.file)) ?? null;
        const elementName = (0, description_1.getGrabSelectionTitle)(result.fiberNode, renderedBy);
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
        (0, grab_controller_1.showGrabSelectionMenu)(ownerId);
    }, [ownerId]);
    (0, react_1.useEffect)(() => {
        (0, grab_controller_1.registerLocalGrabSelectionController)(ownerId, {
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
            (0, grab_controller_1.unregisterLocalGrabSelectionController)(ownerId);
        };
    }, [closeSelectedElementMenu, ownerId, startSession, stopSession]);
    (0, react_1.useEffect)(() => {
        if (!freezeState.isActive) {
            return;
        }
        if (grabControllerState.selectionSessionOwnerId &&
            grabControllerState.selectionSessionOwnerId !== ownerId) {
            return;
        }
        if (grabControllerState.selectionSessionOwnerId !== ownerId) {
            (0, grab_controller_1.setGrabSelectionSessionOwner)(ownerId);
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
    const panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
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
                }
                catch {
                    console.error("[react-native-grab] Grabbing failed.");
                }
                finally {
                    (0, grab_controller_1.setGrabSelectionSessionOwner)(null);
                    stopSession();
                }
            })();
        },
    })).current;
    (0, react_1.useEffect)(() => {
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
    const handleCopySelectedElement = (0, react_1.useCallback)(async () => {
        const selectedElement = state.selectedElement;
        if (!selectedElement) {
            return;
        }
        closeSelectedElementMenu();
        try {
            await (0, copy_1.copyViaMetro)(selectedElement.description);
            showCopiedBadge();
        }
        catch {
            console.error("[react-native-grab] Copying failed. Ensure your Metro config is wrapped with withReactNativeGrab(...) and Metro has been restarted.");
        }
    }, [closeSelectedElementMenu, showCopiedBadge, state.selectedElement]);
    const handleOpenSelectedElement = (0, react_1.useCallback)(async () => {
        const frame = state.selectedElement?.frame;
        if (!frame?.file || frame.line == null) {
            return;
        }
        closeSelectedElementMenu();
        try {
            await (0, open_1.openStackFrameInEditor)({
                file: frame.file,
                lineNumber: frame.line,
            });
        }
        catch {
            console.error("[react-native-grab] Opening editor failed.");
        }
    }, [closeSelectedElementMenu, state.selectedElement]);
    const handleCopyElementPath = (0, react_1.useCallback)(async () => {
        const selectedElement = state.selectedElement;
        if (!selectedElement) {
            return;
        }
        const label = (0, props_1.buildComponentPathLabel)(selectedElement.elementName, selectedElement.frame);
        closeSelectedElementMenu();
        try {
            await (0, copy_1.copyViaMetro)(label);
            showCopiedBadge();
        }
        catch {
            console.error("[react-native-grab] Copying failed. Ensure your Metro config is wrapped with withReactNativeGrab(...) and Metro has been restarted.");
        }
    }, [closeSelectedElementMenu, showCopiedBadge, state.selectedElement]);
    const handleCopyProps = (0, react_1.useCallback)(async () => {
        const selectedElement = state.selectedElement;
        if (!selectedElement) {
            return;
        }
        const propsText = (0, props_1.getSerializedProps)(selectedElement.result.fiberNode);
        if (!propsText) {
            return;
        }
        closeSelectedElementMenu();
        try {
            await (0, copy_1.copyViaMetro)(propsText);
            showCopiedBadge();
        }
        catch {
            console.error("[react-native-grab] Copying failed. Ensure your Metro config is wrapped with withReactNativeGrab(...) and Metro has been restarted.");
        }
    }, [closeSelectedElementMenu, showCopiedBadge, state.selectedElement]);
    const handleToggleLayoutMetrics = (0, react_1.useCallback)(() => {
        setShowLayoutMetrics((prev) => !prev);
    }, []);
    const handleUnfreeze = (0, react_1.useCallback)(() => {
        (0, grab_controller_1.stopGrabFreeze)();
        closeSelectedElementMenu();
    }, [closeSelectedElementMenu]);
    const selectedElementMenuAnchor = (0, react_1.useMemo)(() => {
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
    const statusBadgeText = (0, react_1.useMemo)(() => {
        if (state.isCopyBadgeVisible)
            return "Element copied";
        if (freezeState.isCapturing)
            return "Freezing screen...";
        if (freezeState.error)
            return "Freeze failed";
        if (freezeState.isActive)
            return "Frozen";
        if (state.isSessionEnabled)
            return "Touch and move around to grab";
        return null;
    }, [
        freezeState.error,
        freezeState.isActive,
        freezeState.isCapturing,
        state.isCopyBadgeVisible,
        state.isSessionEnabled,
    ]);
    const layoutMetrics = (0, react_1.useMemo)(() => {
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
    const overlayPointerEvents = isFreezeBlocking && !isMenuOpen ? "auto" : "box-none";
    const overlayTouchHandlers = shouldBlockTouchesInOverlay
        ? isPanEnabled
            ? panResponder.panHandlers
            : {
                onStartShouldSetResponderCapture: () => true,
                onResponderRelease: () => { },
            }
        : null;
    if (!state.isSessionEnabled &&
        !state.isCopyBadgeVisible &&
        !state.grabbedElement &&
        !state.selectedElement &&
        !freezeState.isActive &&
        !freezeState.isCapturing &&
        !freezeState.error) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { pointerEvents: overlayPointerEvents, style: styles.overlayRoot, ...(overlayTouchHandlers ?? {}), onLayout: (event) => {
            const { width, height } = event.nativeEvent.layout;
            setBounds((prev) => {
                if (prev.width === width && prev.height === height) {
                    return prev;
                }
                return { width, height };
            });
        }, children: [freezeState.isActive && freezeState.snapshot?.uri && ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", style: styles.freezeImageWrap, children: (0, jsx_runtime_1.jsx)(react_native_1.Image, { resizeMode: "cover", source: { uri: freezeState.snapshot.uri }, style: styles.freezeImage }) })), statusBadgeText && ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", style: [styles.topBadge, freezeState.error && styles.topBadgeError], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.topBadgeText, children: statusBadgeText }) })), !!highlightedElement && ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", style: [
                    styles.highlight,
                    {
                        left: highlightedElement.rect[0],
                        top: highlightedElement.rect[1],
                        width: highlightedElement.rect[2],
                        height: highlightedElement.rect[3],
                    },
                ] })), showLayoutMetrics && layoutMetrics && ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", style: [
                    styles.metricsBadge,
                    {
                        left: Math.min(Math.max(8, layoutMetrics.x), Math.max(8, bounds.width - 160)),
                        top: Math.max(8, layoutMetrics.y - 28),
                    },
                ], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.metricsText, children: `x:${layoutMetrics.x} y:${layoutMetrics.y} w:${layoutMetrics.width} h:${layoutMetrics.height}` }) })), (0, jsx_runtime_1.jsxs)(context_menu_1.ContextMenu, { anchor: selectedElementMenuAnchor, bounds: bounds, cutout: state.selectedElement
                    ? {
                        x: state.selectedElement.result.rect[0],
                        y: state.selectedElement.result.rect[1],
                        width: state.selectedElement.result.rect[2],
                        height: state.selectedElement.result.rect[3],
                    }
                    : null, horizontalAlignment: "center", offset: { x: 0, y: 8 }, onClose: closeSelectedElementMenu, visible: state.selectedElement !== null, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.selectionMenuHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { adjustsFontSizeToFit: true, minimumFontScale: 0.65, numberOfLines: 1, style: styles.selectionMenuTitle, children: state.selectedElement?.elementName }) }), (0, jsx_runtime_1.jsx)(context_menu_1.ContextMenu.Item, { onPress: () => void handleCopySelectedElement(), children: "Copy summary" }), (0, jsx_runtime_1.jsx)(context_menu_1.ContextMenu.Item, { onPress: () => void handleCopyElementPath(), children: "Copy name + path" }), (0, jsx_runtime_1.jsx)(context_menu_1.ContextMenu.Item, { onPress: () => void handleCopyProps(), children: "Copy props JSON" }), (0, jsx_runtime_1.jsx)(context_menu_1.ContextMenu.Item, { onPress: handleToggleLayoutMetrics, children: showLayoutMetrics ? "Hide layout metrics" : "Show layout metrics" }), (0, jsx_runtime_1.jsx)(context_menu_1.ContextMenu.Item, { disabled: !state.selectedElement?.frame?.file, onPress: () => void handleOpenSelectedElement(), children: "Open in editor" }), freezeState.isActive && ((0, jsx_runtime_1.jsx)(context_menu_1.ContextMenu.Item, { destructive: true, onPress: handleUnfreeze, children: "Unfreeze" }))] })] }));
};
exports.ReactNativeGrabOverlay = ReactNativeGrabOverlay;
const styles = react_native_1.StyleSheet.create({
    overlayRoot: {
        ...react_native_1.StyleSheet.absoluteFillObject,
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
        backgroundColor: grab_colors_1.GRAB_BADGE_BACKGROUND,
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
        backgroundColor: grab_colors_1.GRAB_HIGHLIGHT_FILL,
        borderWidth: 1,
        borderColor: grab_colors_1.GRAB_PRIMARY,
    },
    freezeImageWrap: {
        ...react_native_1.StyleSheet.absoluteFillObject,
    },
    freezeImage: {
        ...react_native_1.StyleSheet.absoluteFillObject,
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
        width: react_native_1.StyleSheet.hairlineWidth,
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
//# sourceMappingURL=grab-overlay.js.map
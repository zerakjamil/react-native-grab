"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeGrabRootControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const dev_menu_1 = require("./dev-menu");
const full_screen_overlay_1 = require("./full-screen-overlay");
const grab_controller_1 = require("./grab-controller");
const grab_control_bar_1 = require("./grab-control-bar");
const BAR_HEIGHT = 36;
const BAR_WIDTH = 108;
const INITIAL_BAR_POSITION = {
    x: (react_native_1.Dimensions.get("window").width - BAR_WIDTH) / 2,
    y: 72,
};
const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};
const ReactNativeGrabRootControls = () => {
    const state = (0, grab_controller_1.useGrabControllerState)();
    const controlBarPosition = (0, react_1.useRef)(new react_native_1.Animated.ValueXY(INITIAL_BAR_POSITION)).current;
    const shouldResetControlBarPositionRef = (0, react_1.useRef)(false);
    const isControlBarVisible = state.isMenuVisible && state.selectionSessionOwnerId === null && state.selectedOwnerId === null;
    const toggleMenuVisibility = (0, react_1.useCallback)(() => {
        shouldResetControlBarPositionRef.current = state.isMenuVisible;
        (0, grab_controller_1.toggleGrabMenu)();
    }, [state.isMenuVisible]);
    const resetControlBarPosition = (0, react_1.useCallback)(() => {
        if (!shouldResetControlBarPositionRef.current) {
            return;
        }
        shouldResetControlBarPositionRef.current = false;
        controlBarPosition.setValue(INITIAL_BAR_POSITION);
    }, [controlBarPosition]);
    (0, dev_menu_1.useDevMenu)(toggleMenuVisibility);
    const dragHandlePanResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
            controlBarPosition.stopAnimation((value) => {
                controlBarPosition.setOffset(value);
                controlBarPosition.setValue({ x: 0, y: 0 });
            });
        },
        onPanResponderMove: react_native_1.Animated.event([null, { dx: controlBarPosition.x, dy: controlBarPosition.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            controlBarPosition.flattenOffset();
            controlBarPosition.stopAnimation((value) => {
                const { width, height } = react_native_1.Dimensions.get("window");
                controlBarPosition.setValue({
                    x: clamp(value.x, 0, Math.max(0, width - BAR_WIDTH)),
                    y: clamp(value.y, 0, Math.max(0, height - BAR_HEIGHT)),
                });
            });
        },
        onPanResponderTerminate: () => {
            controlBarPosition.flattenOffset();
            controlBarPosition.stopAnimation((value) => {
                const { width, height } = react_native_1.Dimensions.get("window");
                controlBarPosition.setValue({
                    x: clamp(value.x, 0, Math.max(0, width - BAR_WIDTH)),
                    y: clamp(value.y, 0, Math.max(0, height - BAR_HEIGHT)),
                });
            });
        },
    })).current;
    const containerStyle = (0, react_1.useMemo)(() => [
        styles.controlBar,
        {
            transform: controlBarPosition.getTranslateTransform(),
        },
    ], [controlBarPosition]);
    return ((0, jsx_runtime_1.jsx)(full_screen_overlay_1.FullScreenOverlay, { children: (0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "box-none", style: styles.overlayRoot, children: (0, jsx_runtime_1.jsx)(grab_control_bar_1.GrabControlBar, { containerStyle: containerStyle, dragHandlePanHandlers: dragHandlePanResponder.panHandlers, isSessionEnabled: state.selectionSessionOwnerId !== null, isVisible: isControlBarVisible, onHidden: resetControlBarPosition, onPressHide: toggleMenuVisibility, onPressSelect: grab_controller_1.enableGrabbing }) }) }));
};
exports.ReactNativeGrabRootControls = ReactNativeGrabRootControls;
const styles = react_native_1.StyleSheet.create({
    overlayRoot: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
    controlBar: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 2,
    },
});
//# sourceMappingURL=grab-root-controls.js.map
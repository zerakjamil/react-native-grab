import { GestureResponderHandlers, type StyleProp, type ViewStyle } from "react-native";
export type GrabControlBarProps = {
  dragHandlePanHandlers?: GestureResponderHandlers;
  isFreezeActive: boolean;
  isFreezeCapturing: boolean;
  isSessionEnabled: boolean;
  isVisible: boolean;
  onHidden?: () => void;
  onPressFreeze: () => void;
  onPressHide: () => void;
  onPressSelect: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};
export declare const GrabControlBar: ({
  dragHandlePanHandlers,
  isFreezeActive,
  isFreezeCapturing,
  isSessionEnabled,
  isVisible,
  onHidden,
  onPressFreeze,
  onPressHide,
  onPressSelect,
  containerStyle,
  style,
}: GrabControlBarProps) => import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=grab-control-bar.d.ts.map

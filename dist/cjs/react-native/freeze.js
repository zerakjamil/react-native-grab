"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureGrabFreezeSnapshot = exports.isGrabFreezeSupported = void 0;
const react_native_1 = require("react-native");
const getViewShotModule = () => {
  try {
    return require("react-native-view-shot");
  } catch {
    return null;
  }
};
const isGrabFreezeSupported = () => {
  const viewShot = getViewShotModule();
  return Boolean(viewShot?.captureScreen);
};
exports.isGrabFreezeSupported = isGrabFreezeSupported;
const captureGrabFreezeSnapshot = async () => {
  const viewShot = getViewShotModule();
  if (!viewShot?.captureScreen) {
    throw new Error("react-native-view-shot is not available");
  }
  const { width, height, scale } = react_native_1.Dimensions.get("window");
  const uri = await viewShot.captureScreen({
    format: "png",
    quality: 1,
    result: "tmpfile",
  });
  return {
    uri,
    width,
    height,
    scale,
  };
};
exports.captureGrabFreezeSnapshot = captureGrabFreezeSnapshot;
//# sourceMappingURL=freeze.js.map

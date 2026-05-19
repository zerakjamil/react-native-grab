const noop = () => {};
const Passthrough = ({ children }) => children;
export const ReactNativeGrabRoot = __DEV__
  ? require("./grab-root").ReactNativeGrabRoot
  : Passthrough;
export const ReactNativeGrabScreen = __DEV__
  ? require("./grab-screen").ReactNativeGrabScreen
  : Passthrough;
export const ReactNativeGrabModal = __DEV__
  ? require("./grab-modal").ReactNativeGrabModal
  : Passthrough;
export const ReactNativeGrabContextProvider = __DEV__
  ? require("./grab-context").ReactNativeGrabContextProvider
  : Passthrough;
export const enableGrabbing = __DEV__ ? require("./grab-controller").enableGrabbing : noop;
export const toggleGrabFreeze = __DEV__ ? require("./grab-controller").toggleGrabFreeze : noop;
export const setFocusEffect = __DEV__ ? require("./focus-effect").setFocusEffect : noop;
if (__DEV__) {
  const patchModal = require("./patch-modal").patchReactNativeModal;
  patchModal(ReactNativeGrabModal);
}
//# sourceMappingURL=index.js.map

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchAllModals =
  exports.setFocusEffect =
  exports.toggleGrabFreeze =
  exports.enableGrabbing =
  exports.ReactNativeGrabContextProvider =
  exports.ReactNativeGrabModal =
  exports.ReactNativeGrabScreen =
  exports.ReactNativeGrabRoot =
    void 0;
const noop = () => {};
const Passthrough = ({ children }) => children;
exports.ReactNativeGrabRoot = __DEV__ ? require("./grab-root").ReactNativeGrabRoot : Passthrough;
exports.ReactNativeGrabScreen = __DEV__
  ? require("./grab-screen").ReactNativeGrabScreen
  : Passthrough;
exports.ReactNativeGrabModal = __DEV__ ? require("./grab-modal").ReactNativeGrabModal : Passthrough;
exports.ReactNativeGrabContextProvider = __DEV__
  ? require("./grab-context").ReactNativeGrabContextProvider
  : Passthrough;
exports.enableGrabbing = __DEV__ ? require("./grab-controller").enableGrabbing : noop;
exports.toggleGrabFreeze = __DEV__ ? require("./grab-controller").toggleGrabFreeze : noop;
exports.setFocusEffect = __DEV__ ? require("./focus-effect").setFocusEffect : noop;
exports.patchAllModals = __DEV__
  ? () => {
      const patchModal = require("./patch-modal").patchReactNativeModal;
      const ReactNativeGrabModal = require("./grab-modal").ReactNativeGrabModal;
      patchModal(ReactNativeGrabModal);
    }
  : noop;
if (__DEV__) {
  const patchModal = require("./patch-modal").patchReactNativeModal;
  patchModal(exports.ReactNativeGrabModal);
}
//# sourceMappingURL=index.js.map

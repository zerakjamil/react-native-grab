"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNodeAtPoint = exports.measureInWindow = void 0;
const measureInWindow = (node) => {
  let boundingClientRect = null;
  nativeFabricUIManager.measureInWindow(node, (x, y, width, height) => {
    boundingClientRect = [x, y, width, height];
  });
  if (!boundingClientRect) {
    throw new Error("Failed to measure node");
  }
  return boundingClientRect;
};
exports.measureInWindow = measureInWindow;
const findNodeAtPoint = (node, x, y) => {
  let fiberNode = null;
  nativeFabricUIManager.findNodeAtPoint(node, x, y, (internalNode) => {
    fiberNode = internalNode;
  });
  return fiberNode;
};
exports.findNodeAtPoint = findNodeAtPoint;
//# sourceMappingURL=measure.js.map

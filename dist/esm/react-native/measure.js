export const measureInWindow = (node) => {
  let boundingClientRect = null;
  nativeFabricUIManager.measureInWindow(node, (x, y, width, height) => {
    boundingClientRect = [x, y, width, height];
  });
  if (!boundingClientRect) {
    throw new Error("Failed to measure node");
  }
  return boundingClientRect;
};
export const findNodeAtPoint = (node, x, y) => {
  let fiberNode = null;
  nativeFabricUIManager.findNodeAtPoint(node, x, y, (internalNode) => {
    fiberNode = internalNode;
  });
  return fiberNode;
};
//# sourceMappingURL=measure.js.map

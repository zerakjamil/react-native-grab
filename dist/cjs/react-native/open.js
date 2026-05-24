"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.openStackFrameInEditor = void 0;
const getDevServer_1 = __importDefault(
  require("react-native/Libraries/Core/Devtools/getDevServer"),
);
const openStackFrameInEditor = async (payload) => {
  const response = await fetch(`${(0, getDevServer_1.default)().url}open-stack-frame`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Open stack frame request failed with status ${response.status}`);
  }
};
exports.openStackFrameInEditor = openStackFrameInEditor;
//# sourceMappingURL=open.js.map

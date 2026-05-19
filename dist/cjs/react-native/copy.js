"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyViaMetro = void 0;
const getDevServer_1 = __importDefault(require("react-native/Libraries/Core/Devtools/getDevServer"));
const DEFAULT_COPY_ENDPOINT = "/__react-native-grab/copy";
const hasProtocol = (url) => /^https?:\/\//i.test(url);
const resolveEndpointUrl = (endpoint) => {
    const resolvedEndpoint = endpoint ?? DEFAULT_COPY_ENDPOINT;
    if (hasProtocol(resolvedEndpoint)) {
        return resolvedEndpoint;
    }
    const baseUrl = (0, getDevServer_1.default)().url;
    const normalizedEndpoint = resolvedEndpoint.startsWith("/")
        ? resolvedEndpoint.slice(1)
        : resolvedEndpoint;
    return `${baseUrl}${normalizedEndpoint}`;
};
const copyViaMetro = async (text, options = {}) => {
    if (!text.trim()) {
        throw new Error("Text to copy cannot be empty");
    }
    const response = await fetch(resolveEndpointUrl(options.endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: options.signal,
    });
    let payload;
    try {
        payload = (await response.json());
    }
    catch {
        payload = undefined;
    }
    if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error ?? `Copy request failed with status ${response.status}`);
    }
};
exports.copyViaMetro = copyViaMetro;
//# sourceMappingURL=copy.js.map
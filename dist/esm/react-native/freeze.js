import { Dimensions } from "react-native";
const getViewShotModule = () => {
    try {
        return require("react-native-view-shot");
    }
    catch {
        return null;
    }
};
export const isGrabFreezeSupported = () => {
    const viewShot = getViewShotModule();
    return Boolean(viewShot?.captureScreen);
};
export const captureGrabFreezeSnapshot = async () => {
    const viewShot = getViewShotModule();
    if (!viewShot?.captureScreen) {
        throw new Error("react-native-view-shot is not available");
    }
    const { width, height, scale } = Dimensions.get("window");
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
//# sourceMappingURL=freeze.js.map
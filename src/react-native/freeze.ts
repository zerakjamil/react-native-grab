import { Dimensions } from "react-native";

type ViewShotModule = {
  captureScreen: (options: {
    format?: "png" | "jpg";
    quality?: number;
    result?: "tmpfile" | "base64" | "data-uri";
  }) => Promise<string>;
};

export type GrabFreezeSnapshot = {
  uri: string;
  width: number;
  height: number;
  scale: number;
};

const getViewShotModule = (): ViewShotModule | null => {
  try {
    return require("react-native-view-shot") as ViewShotModule;
  } catch {
    return null;
  }
};

export const isGrabFreezeSupported = (): boolean => {
  const viewShot = getViewShotModule();
  return Boolean(viewShot?.captureScreen);
};

export const captureGrabFreezeSnapshot = async (): Promise<GrabFreezeSnapshot> => {
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

export type GrabFreezeSnapshot = {
  uri: string;
  width: number;
  height: number;
  scale: number;
};
export declare const isGrabFreezeSupported: () => boolean;
export declare const captureGrabFreezeSnapshot: () => Promise<GrabFreezeSnapshot>;
//# sourceMappingURL=freeze.d.ts.map

export type ReactNativeShadowNode = unknown;
export type ReactNativeFiberNode = {
    type?: unknown;
    return?: ReactNativeFiberNode | null;
    child?: ReactNativeFiberNode | null;
    sibling?: ReactNativeFiberNode | null;
    memoizedProps?: Record<string, unknown> | null;
    stateNode: {
        node: ReactNativeShadowNode;
    } | null;
    _debugStack: Error;
    _debugOwner: unknown;
    _debugSource?: {
        fileName: string;
        lineNumber: number;
        columnNumber?: number;
    } | null;
};
export type BoundingClientRect = [number, number, number, number];
//# sourceMappingURL=types.d.ts.map
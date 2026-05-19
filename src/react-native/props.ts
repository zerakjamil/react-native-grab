import type { RenderedByFrame } from "./get-rendered-by";
import type { ReactNativeFiberNode } from "./types";

type SerializableValue =
  | null
  | string
  | number
  | boolean
  | SerializableValue[]
  | { [key: string]: SerializableValue };

const MAX_DEPTH = 5;
const MAX_ARRAY_LENGTH = 40;

const getReactElementLabel = (value: Record<string, unknown>): string => {
  const type = value?.type as unknown;
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || "Anonymous";
  }
  return "ReactElement";
};

const toSerializable = (
  value: unknown,
  depth: number,
  seen: WeakSet<object>,
): SerializableValue => {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "function") return "[Function]";
  if (typeof value === "symbol") return value.toString();

  if (typeof value !== "object") {
    return String(value);
  }

  if (seen.has(value as object)) {
    return "[Circular]";
  }

  if (depth >= MAX_DEPTH) {
    return "[Truncated]";
  }

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_LENGTH).map((item) => toSerializable(item, depth + 1, seen));
  }

  const record = value as Record<string, unknown>;
  if ("$$typeof" in record && "type" in record) {
    return `[ReactElement ${getReactElementLabel(record)}]`;
  }

  const result: Record<string, SerializableValue> = {};
  for (const [key, entry] of Object.entries(record)) {
    result[key] = toSerializable(entry, depth + 1, seen);
  }
  return result;
};

export const buildComponentPathLabel = (
  elementName: string,
  frame: RenderedByFrame | null,
): string => {
  if (!frame?.file) {
    return elementName;
  }

  const lineSuffix = frame.line != null ? `:${frame.line}` : "";
  return `${elementName} (${frame.file}${lineSuffix})`;
};

export const getSerializedProps = (node: ReactNativeFiberNode): string | null => {
  const props = node?.memoizedProps;
  if (!props || typeof props !== "object") {
    return null;
  }

  const serializable = toSerializable(props, 0, new WeakSet());
  return JSON.stringify(serializable, null, 2);
};

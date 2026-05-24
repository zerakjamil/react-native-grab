import { getRenderedBy } from "./get-rendered-by";
import { ReactNativeGrabInternalContext } from "./grab-context";
const MAX_STACK_LINES = 6;
const MAX_TEXT_LENGTH = 120;
const MAX_ATTR_VALUE_LENGTH = 80;
const MAX_ATTRS = 6;
const MAX_CHILDREN_LINES = 4;
const PRIORITY_ATTRS = [
    "testID",
    "nativeID",
    "accessibilityLabel",
    "accessibilityRole",
    "accessibilityHint",
    "accessibilityValue",
];
/** Owner names treated as host-like when resolving `Text (in Owner)` for the grab menu. */
export const GRAB_HOST_LIKE_COMPONENT_NAMES = ["View", "Text"];
const HOST_LIKE_NAME_SET = new Set(GRAB_HOST_LIKE_COMPONENT_NAMES);
export const isHostLikeComponentName = (name) => HOST_LIKE_NAME_SET.has(name.trim());
const firstHostLikeRenderedByName = (renderedBy) => {
    const frame = renderedBy.find((f) => isHostLikeComponentName(f.name));
    const trimmed = frame?.name?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
};
const firstNonHostRenderedByName = (renderedBy) => {
    const frame = renderedBy.find((f) => !isHostLikeComponentName(f.name));
    const trimmed = frame?.name?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
};
const truncate = (value, maxLength) => {
    if (value.length <= maxLength)
        return value;
    return `${value.slice(0, maxLength - 3)}...`;
};
const escapeAttr = (value) => {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n|\r/g, " ")
        .replace(/"/g, '\\"');
};
const stringifyAttrValue = (value) => {
    if (value == null)
        return null;
    if (typeof value === "string") {
        if (value.trim().length === 0)
            return null;
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        }
        catch {
            return String(value);
        }
    }
    return null;
};
const collectPrimitiveText = (value, out) => {
    if (typeof value === "string" || typeof value === "number") {
        const text = String(value).trim();
        if (text.length > 0)
            out.push(text);
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            collectPrimitiveText(item, out);
        }
    }
};
const extractTextPreview = (props) => {
    if (!props || !("children" in props))
        return "";
    const parts = [];
    collectPrimitiveText(props.children, parts);
    if (parts.length === 0)
        return "";
    const normalized = parts.join(" ").replace(/\s+/g, " ").trim();
    return truncate(normalized, MAX_TEXT_LENGTH);
};
const getHostFiber = (node) => {
    let current = node;
    while (current) {
        if (typeof current.type === "string") {
            return current;
        }
        current = current.return ?? null;
    }
    return node ?? null;
};
const getHostComponentName = (fiber) => {
    const componentType = fiber?.type;
    if (typeof componentType === "string" && componentType.length > 0) {
        return componentType;
    }
    return "(unknown)";
};
const getMemoizedProps = (fiber) => {
    const props = fiber?.memoizedProps;
    if (!props || typeof props !== "object")
        return null;
    return props;
};
const extractPriorityAttrs = (props) => {
    if (!props)
        return "";
    const pairs = [];
    for (const key of PRIORITY_ATTRS) {
        if (pairs.length >= MAX_ATTRS)
            break;
        const rawValue = stringifyAttrValue(props[key]);
        if (!rawValue)
            continue;
        const value = escapeAttr(truncate(rawValue, MAX_ATTR_VALUE_LENGTH));
        pairs.push(`${key}="${value}"`);
    }
    return pairs.length > 0 ? ` ${pairs.join(" ")}` : "";
};
const extractPriorityAttrsAsJSON = (props) => {
    if (!props)
        return "";
    const pairs = [];
    for (const key of PRIORITY_ATTRS) {
        if (pairs.length >= MAX_ATTRS)
            break;
        const rawValue = props[key];
        if (rawValue == null)
            continue;
        const serialized = typeof rawValue === "string"
            ? `"${escapeAttr(truncate(rawValue, MAX_ATTR_VALUE_LENGTH))}"`
            : String(rawValue);
        pairs.push(`${key}: ${serialized}`);
    }
    return pairs.length > 0 ? `{ ${pairs.join(", ")} }` : "";
};
const getPreviewComponentName = (node, renderedBy) => {
    const fromRenderedBy = firstNonHostRenderedByName(renderedBy);
    if (fromRenderedBy)
        return fromRenderedBy;
    const hostFiber = getHostFiber(node);
    return getHostComponentName(hostFiber);
};
const buildElementPreview = (node, renderedBy) => {
    const componentName = getPreviewComponentName(node, renderedBy);
    const hostFiber = getHostFiber(node);
    const props = getMemoizedProps(hostFiber);
    const attrs = extractPriorityAttrs(props);
    const text = extractTextPreview(props);
    if (!text) {
        return `<${componentName}${attrs} />`;
    }
    return `<${componentName}${attrs}>\n  ${text}\n</${componentName}>`;
};
const formatFrameLocation = (file, line, column) => {
    if (!file)
        return null;
    if (line == null)
        return file;
    if (column == null)
        return `${file}:${line}`;
    return `${file}:${line}:${column}`;
};
const buildStackContext = (renderedBy) => {
    const lines = renderedBy
        .filter((frame) => Boolean(frame.file))
        .slice(0, MAX_STACK_LINES)
        .map((frame) => {
        const location = formatFrameLocation(frame.file, frame.line, frame.column);
        if (!location)
            return "";
        return `\n  in ${frame.name} (at ${location})`;
    })
        .filter(Boolean);
    return lines.join("");
};
const isGrabContextProviderFiber = (fiber) => {
    const providerType = fiber.type;
    return (providerType === ReactNativeGrabInternalContext ||
        providerType === ReactNativeGrabInternalContext.Provider);
};
const getGrabContextFromFiber = (node) => {
    let current = node;
    while (current) {
        if (isGrabContextProviderFiber(current)) {
            return current.memoizedProps?.value ?? null;
        }
        current = current.return ?? null;
    }
    return null;
};
const buildContextBlock = (contextValue) => {
    if (!contextValue || Object.keys(contextValue).length === 0) {
        return "";
    }
    return `\n\nContext:\n${JSON.stringify(contextValue, null, 2)}`;
};
export const getGrabSelectionTitle = (node, renderedBy) => {
    const fromFiber = getHostComponentName(getHostFiber(node));
    const rawHostLabel = firstHostLikeRenderedByName(renderedBy) ?? (fromFiber !== "(unknown)" ? fromFiber : null);
    const hostUnknown = rawHostLabel == null;
    const hostLabel = hostUnknown ? "Selected element" : rawHostLabel;
    const ownerName = firstNonHostRenderedByName(renderedBy);
    if (ownerName && ownerName !== hostLabel) {
        return `${hostLabel} (in ${ownerName})`;
    }
    return hostLabel;
};
const getFiberDebugSource = (fiber) => {
    if (!fiber._debugSource?.fileName)
        return null;
    return {
        file: fiber._debugSource.fileName,
        line: fiber._debugSource.lineNumber ?? null,
        column: fiber._debugSource.columnNumber ?? null,
    };
};
const getFiberDisplayName = (fiber) => {
    if (!fiber)
        return "(null)";
    const t = fiber.type;
    if (typeof t === "string")
        return t;
    if (typeof t === "function") {
        const fn = t;
        return fn.displayName || fn.name || "(anonymous)";
    }
    if (t && typeof t === "object") {
        const obj = t;
        if (typeof obj.displayName === "string")
            return obj.displayName;
        if (typeof obj.render === "function") {
            const r = obj.render;
            return r.displayName || r.name || "ForwardRef";
        }
        if (typeof obj.type === "function") {
            const inner = obj.type;
            return inner.displayName || inner.name || "Memo";
        }
    }
    return "(component)";
};
const collectFiberTextContent = (fiber, out) => {
    if (!fiber)
        return;
    const t = fiber.type;
    if (t === "Text" || t === "RCTText") {
        const props = fiber.memoizedProps;
        if (props && "children" in props) {
            collectPrimitiveText(props.children, out);
        }
    }
    let child = fiber.child;
    while (child) {
        collectFiberTextContent(child, out);
        child = child.sibling;
    }
};
const getChildrenSummary = (fiber) => {
    const lines = [];
    let child = fiber.child;
    while (child) {
        if (lines.length >= MAX_CHILDREN_LINES) {
            lines.push("  ...");
            break;
        }
        const name = getFiberDisplayName(child);
        const textParts = [];
        collectFiberTextContent(child, textParts);
        if (textParts.length > 0) {
            const text = textParts.join(" ").replace(/\s+/g, " ").trim();
            lines.push(`  ${name}: "${truncate(text, 80)}"`);
        }
        else {
            lines.push(`  ${name}`);
        }
        child = child.sibling;
    }
    return lines.join("\n");
};
const extractStyleSummary = (props) => {
    if (!props)
        return "";
    const style = props.style;
    if (!style || typeof style !== "object")
        return "";
    const entries = [];
    const keys = [
        "flexDirection",
        "justifyContent",
        "alignItems",
        "flex",
        "padding",
        "margin",
        "backgroundColor",
        "borderWidth",
        "borderRadius",
        "width",
        "height",
        "minWidth",
        "minHeight",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "gap",
    ];
    for (const key of keys) {
        if (key in style && style[key] != null) {
            entries.push(`${key}: ${String(style[key])}`);
        }
    }
    return entries.length > 0 ? `{ ${entries.join(", ")} }` : "";
};
const resolvePrimarySource = (node, hostFiber, renderedBy) => {
    const fiberSource = getFiberDebugSource(node);
    if (fiberSource)
        return formatFrameLocation(fiberSource.file, fiberSource.line, fiberSource.column);
    if (hostFiber && hostFiber !== node) {
        const hostSource = getFiberDebugSource(hostFiber);
        if (hostSource)
            return formatFrameLocation(hostSource.file, hostSource.line, hostSource.column);
    }
    const framesWithFile = renderedBy.filter((f) => f.file);
    const sourceFrame = framesWithFile[0] ?? null;
    if (sourceFrame)
        return formatFrameLocation(sourceFrame.file, sourceFrame.line, sourceFrame.column);
    return null;
};
export const getDescription = async (node) => {
    let renderedBy = await getRenderedBy(node);
    const componentName = getPreviewComponentName(node, renderedBy);
    const hostFiber = getHostFiber(node);
    const hostType = getHostComponentName(hostFiber);
    const props = getMemoizedProps(hostFiber);
    const attrsJSON = extractPriorityAttrsAsJSON(props);
    const text = extractTextPreview(props);
    const primarySource = resolvePrimarySource(node, hostFiber, renderedBy);
    const framesWithFile = renderedBy.filter((f) => f.file);
    const childrenSummary = hostFiber ? getChildrenSummary(hostFiber) : "";
    const styleSummary = extractStyleSummary(props);
    const lines = [];
    if (hostType && hostType !== "(unknown)" && hostType !== componentName) {
        lines.push(`Element: ${hostType} (in ${componentName})`);
    }
    else {
        lines.push(`Element: ${componentName}`);
    }
    if (primarySource) {
        lines.push(`Source: ${primarySource}`);
    }
    if (styleSummary) {
        lines.push(`Style: ${styleSummary}`);
    }
    if (attrsJSON) {
        lines.push(`Attrs: ${attrsJSON}`);
    }
    if (text) {
        lines.push(`Text: "${text}"`);
    }
    if (childrenSummary) {
        lines.push(`Children:`);
        lines.push(childrenSummary);
    }
    if (framesWithFile.length > 0) {
        lines.push("");
        lines.push("Hierarchy:");
        for (const f of framesWithFile) {
            const loc = formatFrameLocation(f.file, f.line, f.column);
            lines.push(`  ${f.name} (${loc})`);
        }
    }
    const contextValue = getGrabContextFromFiber(node);
    if (contextValue && Object.keys(contextValue).length > 0) {
        lines.push("");
        lines.push("Context:");
        lines.push(`  ${JSON.stringify(contextValue)}`);
    }
    return lines.join("\n");
};
//# sourceMappingURL=description.js.map
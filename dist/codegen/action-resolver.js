// codegen/action-resolver.ts
export function resolveAction(el) {
    const tag = el.tagName?.toLowerCase();
    // Inputs
    if (tag === "input") {
        const type = el.attributes?.type?.toLowerCase();
        if (type === "checkbox")
            return "check";
        if (type === "radio")
            return "check";
        if (type === "file")
            return "upload";
        return "fill";
    }
    // Select dropdown
    if (tag === "select") {
        return "select";
    }
    // Buttons / links
    if (tag === "button" || tag === "a") {
        return "click";
    }
    // Role-based fallback
    if (el.attributes?.role === "button") {
        return "click";
    }
    // Text-based fallback
    if (el.innerText && el.innerText.length < 100) {
        return "click";
    }
    // Default safe action
    return "click";
}

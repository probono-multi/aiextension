export function saveElement(descriptor) {
    chrome.storage.local.get(["automation_repo"], (res) => {
        const repo = res.automation_repo || {};
        const pageKey = new URL(descriptor.pageUrl).pathname || "/";
        if (!repo[pageKey]) {
            repo[pageKey] = {
                pageName: pageKey
                    .split("/")
                    .filter(Boolean)
                    .pop() || "home",
                pageUrl: descriptor.pageUrl,
                elements: []
            };
        }
        // Normalize descriptor
        const normalized = {
            elementId: descriptor.elementId,
            tagName: descriptor.tagName,
            innerText: descriptor.innerText,
            attributes: descriptor.attributes || descriptor.locators || {},
            rankedLocators: descriptor.rankedLocators || [],
            capturedAt: descriptor.capturedAt,
            actions: []
        };
        // infer likely actions for this element to allow generator to make better decisions
        normalized.actions = inferActions(normalized);
        // deduplicate: replace existing entry with same elementId
        const existingIndex = repo[pageKey].elements.findIndex((e) => e.elementId === normalized.elementId);
        if (existingIndex >= 0) {
            repo[pageKey].elements[existingIndex] = normalized;
        }
        else {
            repo[pageKey].elements.push(normalized);
        }
        chrome.storage.local.set({ automation_repo: repo }, () => {
            console.log("📦 Repo at export:", repo);
            console.log("📦 Stored element under:", pageKey);
        });
    });
}
function inferActions(el) {
    const tag = el.tagName?.toLowerCase?.() || "";
    const attrs = el.attributes || {};
    const type = (attrs.type || "").toLowerCase();
    const actions = [];
    if (tag === "button" || tag === "a")
        actions.push("click");
    if (tag === "input") {
        if (type === "checkbox")
            actions.push("check");
        else if (type === "file")
            actions.push("upload");
        else
            actions.push("fill");
    }
    if (tag === "select")
        actions.push("select");
    // fallback: clickable by default
    if (!actions.length)
        actions.push("click");
    return actions;
}

export function saveElement(descriptor) {
    chrome.storage.local.get(["automation_repo"], res => {
        const repo = (res.automation_repo ?? {});
        const key = new URL(descriptor.pageUrl).pathname || "/";
        if (!repo[key]) {
            repo[key] = {
                pageName: key.split("/").pop() || "home",
                pageUrl: descriptor.pageUrl,
                elements: []
            };
        }
        repo[key].elements.push(descriptor);
        chrome.storage.local.set({ automation_repo: repo });
    });
}

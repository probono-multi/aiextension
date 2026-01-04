import { AutomationRepo } from "../domain/repo-model";

export function saveElement(descriptor: any) {
  chrome.storage.local.get(["automation_repo"], res => {
    const repo = (res.automation_repo ?? {}) as AutomationRepo;
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

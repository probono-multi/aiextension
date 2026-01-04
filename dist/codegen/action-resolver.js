export async function resolveSequential(locators) {
    for (const loc of locators) {
        try {
            await loc.waitFor({ timeout: 1000 });
            return loc;
        }
        catch { }
    }
    throw new Error("No locator resolved");
}

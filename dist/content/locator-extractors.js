export function extractLocators(el) {
    return {
        role: el.getAttribute("role") || undefined,
        label: el.getAttribute("aria-label") || undefined,
        placeholder: el.placeholder || undefined,
        testid: el.getAttribute("data-testid") || undefined,
        text: el.innerText?.trim(),
        css: el.id ? `#${el.id}` : undefined
    };
}
export function rankLocators(raw) {
    const ranked = [];
    if (raw.placeholder)
        ranked.push({ playwrightKind: "getByPlaceholder", value: raw.placeholder, score: 95 });
    if (raw.label)
        ranked.push({ playwrightKind: "getByLabel", value: raw.label, score: 90 });
    if (raw.role)
        ranked.push({ playwrightKind: "getByRole", value: raw.role, score: 85 });
    if (raw.text && raw.text.length < 80)
        ranked.push({ playwrightKind: "getByText", value: raw.text, score: 70 });
    if (raw.css)
        ranked.push({ playwrightKind: "locator", value: raw.css, score: 50 });
    return ranked.sort((a, b) => b.score - a.score);
}

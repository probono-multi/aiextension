export function generateDiffReport(
  previous: any,
  current: any
): string {
  if (!previous) {
    return "Initial generation — no previous snapshot available.";
  }

  let report = "";

  Object.keys(current).forEach(pageKey => {
    report += `\n${current[pageKey].pageName}Page\n`;

    const prevPage = previous[pageKey];
    const currPage = current[pageKey];

    if (!prevPage) {
      report += "  + Page added\n";
      return;
    }

    const prevElements = prevPage.elements || [];
    const currElements = currPage.elements || [];

    currElements.forEach((el: any, index: number) => {
      const prevEl = prevElements[index];

      if (!prevEl) {
        report += "  + Element added\n";
        return;
      }

      const prevLocator = prevEl.rankedLocators?.[0]?.value;
      const currLocator = el.rankedLocators?.[0]?.value;

      if (prevLocator !== currLocator) {
        report += `  ~ Locator updated\n`;
        report += `    from ${prevLocator}\n`;
        report += `    to   ${currLocator}\n`;
      }
    });

    if (prevElements.length > currElements.length) {
      report += "  - Element removed\n";
    }
  });

  return report.trim();
}

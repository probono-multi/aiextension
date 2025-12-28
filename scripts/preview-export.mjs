import { generatePlaywrightTS } from '../dist/codegen/playwright-ts.js';
import { generatePlaywrightPY } from '../dist/codegen/playwright-py.js';

const sample = {
  pageName: 'login',
  elements: [
    {
      elementId: '1',
      tagName: 'input',
      innerText: '',
      attributes: { placeholder: 'Email', id: 'email', name: 'email' },
      rankedLocators: [
        { playwrightKind: 'getByLabel', value: 'Email', stabilityScore: 100, strategy: 'label' },
        { playwrightKind: 'getByTestId', value: 'login-email', stabilityScore: 98, strategy: 'testid' },
        { playwrightKind: 'locator', value: '#email', stabilityScore: 88, strategy: 'id' }
      ],
    },
    {
      elementId: '2',
      tagName: 'button',
      innerText: 'Sign in',
      attributes: { },
      rankedLocators: [
        { playwrightKind: 'getByText', value: 'Sign in', stabilityScore: 90, strategy: 'text' },
        { playwrightKind: 'locator', value: 'button.primary', stabilityScore: 70, strategy: 'css' }
      ]
    }
  ]
};

console.log('--- TS chain ---');
console.log(generatePlaywrightTS(sample, 'chain'));
console.log('\n--- TS sequential ---');
console.log(generatePlaywrightTS(sample, 'sequential'));
console.log('\n--- PY chain ---');
console.log(generatePlaywrightPY(sample, 'chain'));
console.log('\n--- PY sequential ---');
console.log(generatePlaywrightPY(sample, 'sequential'));

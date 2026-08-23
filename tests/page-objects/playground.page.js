import { BasePage } from './base.page.js';

export class PlaygroundPage extends BasePage {
    get inspectToggle() { return '#inspect-toggle'; }
    get locatorTypeSelect() { return '#locator-type-select'; }
    get outputLocator() { return '#output-locator-val'; }
    get copyBtn() { return '#copy-locator-btn'; }
    get saveNameInput() { return '#save-name-input'; }
    get saveBtn() { return '#save-locator-btn'; }

    toggleInspector() {
        this.click(this.inspectToggle);
    }

    selectLocatorType(type) {
        const select = this.getElement(this.locatorTypeSelect);
        if (select) {
            select.value = type;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    saveLocator(name) {
        this.type(this.saveNameInput, name);
        this.click(this.saveBtn);
    }

    getGeneratedLocator() {
        const el = this.getElement(this.outputLocator);
        return el ? el.textContent || el.value : '';
    }
}

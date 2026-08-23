export class BasePage {
    getElement(selector) {
        return document.querySelector(selector);
    }

    getElements(selector) {
        return document.querySelectorAll(selector);
    }

    click(selector) {
        const el = this.getElement(selector);
        if (el) {
            el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    }

    type(selector, value) {
        const el = this.getElement(selector);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    isVisible(selector) {
        const el = this.getElement(selector);
        return !!el;
    }
}

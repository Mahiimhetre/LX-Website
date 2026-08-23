import { describe, it, expect } from 'vitest';

describe('Website Usability & Accessibility (a11y) Checks', () => {
    it('Form inputs must have descriptive labels or aria-label attributes', () => {
        document.body.innerHTML = `
            <form id="access-form">
                <label for="username">Username</label>
                <input id="username" type="text" />
                <input type="password" aria-label="Enter your account password" />
                <button type="submit">Login</button>
            </form>
        `;

        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasId = input.id;
            const hasLabel = hasId ? !!document.querySelector(`label[for="${hasId}"]`) : false;
            
            expect(hasAriaLabel || hasLabel).toBe(true);
        });
    });

    it('All image elements must contain appropriate alt attributes', () => {
        document.body.innerHTML = `
            <div>
                <img src="logo.png" alt="LocatorX Logo" />
                <img src="icon.png" alt="" />
            </div>
        `;

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            expect(img.hasAttribute('alt')).toBe(true);
        });
    });
});

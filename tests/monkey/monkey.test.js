import { describe, it, expect } from 'vitest';
import { PlaygroundPage } from '../page-objects/playground.page.js';

describe('Website Monkey Testing', () => {
    it('Should execute 30 chaotic interface interactions without crashes', () => {
        document.body.innerHTML = `
            <div id="app">
                <button id="inspect-toggle">Inspect Off</button>
                <select id="locator-type-select">
                    <option value="css">CSS</option>
                    <option value="xpath">XPath</option>
                </select>
                <input id="output-locator-val" value="" />
                <button id="copy-locator-btn">Copy</button>
                <input id="save-name-input" />
                <button id="save-locator-btn">Save</button>
            </div>
        `;

        const playground = new PlaygroundPage();
        const actionOptions = [
            () => playground.toggleInspector(),
            () => playground.selectLocatorType(Math.random() > 0.5 ? 'css' : 'xpath'),
            () => playground.saveLocator('Random_Elem_' + Math.random()),
            () => playground.getGeneratedLocator()
        ];

        let errorCount = 0;
        for (let i = 0; i < 30; i++) {
            const action = actionOptions[Math.floor(Math.random() * actionOptions.length)];
            try {
                action();
            } catch (err) {
                console.error(`Monkey Error at interaction ${i}:`, err.message);
                errorCount++;
            }
        }

        expect(errorCount).toBe(0);
    });
});

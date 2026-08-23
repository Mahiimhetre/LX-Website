import { describe, it, expect } from 'vitest';
import { LoginPage } from '../page-objects/login.page.js';
import { PlaygroundPage } from '../page-objects/playground.page.js';

describe('Website End-to-End User Flow', () => {
    it('Should navigate, authenticate, open playground, and save element locator', () => {
        // Setup whole mock DOM
        document.body.innerHTML = `
            <div id="app">
                <form id="login-form">
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <button type="submit">Sign In</button>
                </form>
                
                <div id="playground-view" style="display: none;">
                    <button id="inspect-toggle">Inspect Off</button>
                    <select id="locator-type-select">
                        <option value="css">CSS</option>
                        <option value="xpath">XPath</option>
                    </select>
                    <input id="output-locator-val" value="//div[@id='root']" readOnly />
                    <input id="save-name-input" />
                    <button id="save-locator-btn">Save</button>
                </div>
            </div>
        `;

        // 1. Initialize POMs
        const loginPage = new LoginPage();
        const playgroundPage = new PlaygroundPage();

        // Bind fake login submission to show playground
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('playground-view').style.display = 'block';
        });

        // Bind fake save action
        let lastSaved = null;
        document.getElementById('save-locator-btn').addEventListener('click', () => {
            lastSaved = {
                name: document.getElementById('save-name-input').value,
                locator: document.getElementById('output-locator-val').value
            };
        });

        // 2. Perform actions: Login
        loginPage.login('mahesh@locatorx.com', 'password123');
        expect(playgroundPage.isVisible('#playground-view')).toBe(true);

        // 3. Play with locators
        playgroundPage.selectLocatorType('xpath');
        expect(playgroundPage.getGeneratedLocator()).toBe("//div[@id='root']");

        // 4. Save locator
        playgroundPage.saveLocator('Main Container');
        expect(lastSaved).not.toBeNull();
        expect(lastSaved.name).toBe('Main Container');
        expect(lastSaved.locator).toBe("//div[@id='root']");
    });
});

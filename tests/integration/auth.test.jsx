import { describe, it, expect } from 'vitest';
import { LoginPage } from '../page-objects/login.page.js';

describe('Authentication Integration Flow', () => {
    it('LoginPage POM should correctly handle user login input', () => {
        // Setup mock DOM container
        document.body.innerHTML = `
            <form id="login-form">
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button type="submit">Sign In</button>
            </form>
        `;
        
        let formSubmitted = false;
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            formSubmitted = true;
        });

        const page = new LoginPage();
        page.login('test@locatorx.com', 'password123');

        expect(page.getElement('input[type="email"]').value).toBe('test@locatorx.com');
        expect(page.getElement('input[type="password"]').value).toBe('password123');
        expect(formSubmitted).toBe(true);
    });

    it('LoginPage POM should handle user registration inputs', () => {
        document.body.innerHTML = `
            <form id="register-form">
                <input name="name" type="text" />
                <input type="email" />
                <input type="password" />
                <input name="confirmPassword" type="password" />
                <button type="submit">Sign Up</button>
            </form>
        `;
        
        let formSubmitted = false;
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            formSubmitted = true;
        });

        const page = new LoginPage();
        page.register('Mahesh', 'mahesh@locatorx.com', 'mypass123', 'mypass123');

        expect(page.getElement('input[name="name"]').value).toBe('Mahesh');
        expect(page.getElement('input[type="email"]').value).toBe('mahesh@locatorx.com');
        expect(page.getElement('input[type="password"]').value).toBe('mypass123');
        expect(page.getElement('input[name="confirmPassword"]').value).toBe('mypass123');
        expect(formSubmitted).toBe(true);
    });
});

import { BasePage } from './base.page.js';

export class LoginPage extends BasePage {
    get emailInput() { return 'input[type="email"]'; }
    get passwordInput() { return 'input[type="password"]'; }
    get nameInput() { return 'input[name="name"]'; }
    get confirmPasswordInput() { return 'input[name="confirmPassword"]'; }
    get submitBtn() { return 'button[type="submit"]'; }

    login(email, password) {
        this.type(this.emailInput, email);
        this.type(this.passwordInput, password);
        this.click(this.submitBtn);
    }

    register(name, email, password, confirmPassword) {
        this.type(this.nameInput, name);
        this.type(this.emailInput, email);
        this.type(this.passwordInput, password);
        if (confirmPassword) {
            this.type(this.confirmPasswordInput, confirmPassword);
        }
        this.click(this.submitBtn);
    }
}

import { describe, it, expect } from 'vitest';

const translations = {
    en: {
        welcome: 'Welcome to LocatorX',
        login: 'Sign In'
    },
    ja: {
        welcome: 'LocatorXへようこそ',
        login: 'サインイン'
    }
};

describe('Website Localization & Translations', () => {
    it('Should support English dictionary translation strings', () => {
        expect(translations.en.welcome).toBe('Welcome to LocatorX');
        expect(translations.en.login).toBe('Sign In');
    });

    it('Should support Japanese dictionary translation strings', () => {
        expect(translations.ja.welcome).toBe('LocatorXへようこそ');
        expect(translations.ja.login).toBe('サインイン');
    });
});

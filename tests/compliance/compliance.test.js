import { describe, it, expect } from 'vitest';

class GDPRConsentManager {
    constructor() {
        this.consent = { analytics: false, marketing: false };
    }

    setConsent(preferences) {
        Object.assign(this.consent, preferences);
        localStorage.setItem('gdpr_consent', JSON.stringify(this.consent));
    }

    getConsent() {
        const stored = localStorage.getItem('gdpr_consent');
        return stored ? JSON.parse(stored) : this.consent;
    }
}

describe('Website GDPR and Privacy Compliance Checks', () => {
    it('Consent Manager should initialize with false consensus values', () => {
        const manager = new GDPRConsentManager();
        const consent = manager.getConsent();
        
        expect(consent.analytics).toBe(false);
        expect(consent.marketing).toBe(false);
    });

    it('Should persist updated consent preferences to localStorage', () => {
        const manager = new GDPRConsentManager();
        manager.setConsent({ analytics: true });
        
        const consent = manager.getConsent();
        expect(consent.analytics).toBe(true);
        expect(consent.marketing).toBe(false);
    });
});

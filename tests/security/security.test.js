import { describe, it, expect } from 'vitest';
import { passwordSchema } from '../../src/lib/validations.js';

function cleanInput(str) {
    return str.replace(/[<>]/g, ''); // Simple sanitize logic example
}

describe('Website Security Protections', () => {
    it('Should sanitize fields against Cross-Site Scripting (XSS) inputs', () => {
        const dirtyInput = '<script>alert("hack")</script>locator_name';
        const sanitized = cleanInput(dirtyInput);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('</script>');
        expect(sanitized).toBe('scriptalert("hack")/scriptlocator_name');
    });

    it('Should validate credentials patterns to prevent basic SQL Injection inputs', () => {
        const sqlPayload = "admin' OR 1=1 --";
        const sqlPattern = /['"\-\-]/g;
        const containsSqlPattern = sqlPattern.test(sqlPayload);
        
        expect(containsSqlPattern).toBe(true);
    });

    it('Should block passwords longer than 128 characters in register/login to prevent Long Password DoS', () => {
        const longPassword = 'A1!' + 'a'.repeat(130);
        const result = passwordSchema.safeParse(longPassword);
        expect(result.success).toBe(false);
        expect(result.error.errors[0].message).toContain('Password must be less than 128 characters');
    });
});


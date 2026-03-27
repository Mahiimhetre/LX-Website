import { describe, it, expect } from 'vitest';
import { checkPasswordStrength } from './checkPasswordStrength.js';

describe('checkPasswordStrength', () => {
    it('should return score 0 for an empty string', () => {
        const result = checkPasswordStrength('');
        expect(result.score).toBe(0);
        expect(result.label).toBe('weak');
        expect(result.color).toBe('hsl(0, 84%, 60%)');
        expect(result.requirements).toEqual({
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
        });
    });

    it('should handle boundary conditions for length', () => {
        // Length 7
        expect(checkPasswordStrength('abcdefg').requirements.length).toBe(false);
        // Length 8
        expect(checkPasswordStrength('abcdefgh').requirements.length).toBe(true);
    });

    it('should correctly identify uppercase criteria', () => {
        const result = checkPasswordStrength('A');
        expect(result.requirements.uppercase).toBe(true);
        expect(result.requirements.lowercase).toBe(false);
        expect(result.score).toBe(1);
    });

    it('should correctly identify lowercase criteria', () => {
        const result = checkPasswordStrength('a');
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(false);
        expect(result.score).toBe(1);
    });

    it('should correctly identify number criteria', () => {
        const result = checkPasswordStrength('1');
        expect(result.requirements.number).toBe(true);
        expect(result.score).toBe(1);
    });

    it('should correctly identify special character criteria', () => {
        const result = checkPasswordStrength('!');
        expect(result.requirements.special).toBe(true);
        expect(result.score).toBe(1);
    });

    it('should return fair (score 2 or 3)', () => {
        // Score 2: length + lowercase
        const result2 = checkPasswordStrength('abcdefgh');
        expect(result2.score).toBe(2);
        expect(result2.label).toBe('fair');
        expect(result2.color).toBe('hsl(30, 100%, 50%)');

        // Score 3: length + lowercase + uppercase
        const result3 = checkPasswordStrength('Abcdefgh');
        expect(result3.score).toBe(3);
        expect(result3.label).toBe('fair');
        expect(result3.color).toBe('hsl(30, 100%, 50%)');
    });

    it('should return good (score 4)', () => {
        // Score 4: length + lowercase + uppercase + number
        const result = checkPasswordStrength('Abcdefg1');
        expect(result.score).toBe(4);
        expect(result.label).toBe('good');
        expect(result.color).toBe('hsl(45, 100%, 50%)');
    });

    it('should return strong for meeting all criteria (score 5)', () => {
        const result = checkPasswordStrength('Abcdefg1!');
        expect(result.score).toBe(5);
        expect(result.label).toBe('strong');
        expect(result.color).toBe('hsl(142, 69%, 58%)');
        expect(result.requirements).toEqual({
            length: true,
            uppercase: true,
            lowercase: true,
            number: true,
            special: true,
        });
    });
});

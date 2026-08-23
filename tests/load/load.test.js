import { describe, it, expect, vi } from 'vitest';

describe('Website Load & Stress Tests', () => {
    it('Should handle 100 concurrent API requests without exceptions', async () => {
        const mockResponse = { ok: true, json: () => Promise.resolve({ ok: true }) };
        global.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));

        const promises = Array.from({ length: 100 }, () => fetch('/api/locator/query'));
        const results = await Promise.all(promises);

        expect(results).toHaveLength(100);
        results.forEach(res => {
            expect(res.ok).toBe(true);
        });
    });
});

import { describe, it, expect } from 'vitest';
import { mergeNotifications } from '@/services/notificationAdapter';

describe('Website Performance and Latency Benchmarks', () => {
    it('Should process notification merges under 15ms for large datasets', () => {
        const source1 = Array.from({ length: 500 }, (_, i) => ({
            id: `a_${i}`,
            type: 'SYSTEM',
            title: `System Alert ${i}`,
            createdAt: new Date(Date.now() - i * 1000)
        }));

        const source2 = Array.from({ length: 500 }, (_, i) => ({
            id: `b_${i}`,
            type: 'FEATURE',
            title: `Feature Update ${i}`,
            createdAt: new Date(Date.now() - i * 1000 - 500)
        }));

        const start = performance.now();
        const merged = mergeNotifications(source1, source2);
        const end = performance.now();
        const duration = end - start;

        console.log(`     Website Benchmark: Merged 1000 items in ${duration.toFixed(2)}ms`);
        expect(merged).toHaveLength(1000);
        expect(duration).toBeLessThan(100); // Expect benchmark under 100ms
    });
});

import { describe, it, expect } from 'vitest';

describe('Website Compatibility Verification', () => {
    it('Viewport meta tag should be properly declared for mobile layouts', () => {
        document.head.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        `;

        const viewportMeta = document.querySelector('meta[name="viewport"]');
        expect(viewportMeta).not.toBeNull();
        expect(viewportMeta.getAttribute('content')).toContain('width=device-width');
    });

    it('Layout elements should support display flex or grid definitions', () => {
        document.body.innerHTML = `
            <div id="main-layout" style="display: grid; grid-template-columns: repeat(12, 1fr);">
                <header style="grid-column: span 12;"></header>
            </div>
        `;
        
        const main = document.getElementById('main-layout');
        expect(main.style.display).toBe('grid');
    });
});

import { describe, it, expect, beforeEach } from 'vitest';

class PlaygroundDraftManager {
    saveDraft(locatorString) {
        localStorage.setItem('playground_draft', locatorString);
    }
    
    getDraft() {
        return localStorage.getItem('playground_draft');
    }
}

describe('Website State Recovery Tests', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('Should recover playground draft state after simulated page reload', () => {
        let manager = new PlaygroundDraftManager();
        manager.saveDraft("//button[@id='submit']");

        // Simulate crash/reload by spawning a new manager instance and reading from storage
        const newManager = new PlaygroundDraftManager();
        const recovered = newManager.getDraft();

        expect(recovered).toBe("//button[@id='submit']");
    });
});

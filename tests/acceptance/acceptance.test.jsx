import { describe, it, expect } from 'vitest';
import { adaptInvitations } from '@/services/notificationAdapter';

describe('Website Acceptance (UAT) Flows', () => {
    it('Should accept valid team invitations correctly as per customer specification', () => {
        const mockRawInvitation = [{
            id: 100,
            token: 'valid_token_123',
            role: 'editor',
            team: { id: 'team_a', name: 'LocatorX Team' }
        }];

        const adapted = adaptInvitations(mockRawInvitation);
        
        expect(adapted).toHaveLength(1);
        expect(adapted[0].title).toContain('LocatorX Team');
        expect(adapted[0].metadata.role).toBe('editor');
    });
});

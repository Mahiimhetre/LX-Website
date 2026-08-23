/**
 * notificationAdapter.test.js
 * Unit tests for the notification adapter service.
 */

import { describe, it, expect } from 'vitest';
import {
    adaptNotifications,
    adaptInvitations,
    mergeNotifications,
} from '@/services/notificationAdapter';

describe('adaptNotifications', () => {
    it('returns an empty array when called with no arguments', () => {
        expect(adaptNotifications()).toEqual([]);
    });

    it('normalizes a valid notification with all fields', () => {
        const now = new Date().toISOString();
        const raw = [
            {
                id: 42,
                type: 'TEAM_INVITE',
                title: 'You are invited',
                message: 'Join the team',
                metadata: { teamId: '1', teamName: 'Alpha' },
                actions: [{ label: 'Accept', variant: 'default', key: 'accept' }],
                isRead: false,
                createdAt: now,
            },
        ];

        const [n] = adaptNotifications(raw);
        expect(n.id).toBe('42');
        expect(n.type).toBe('TEAM_INVITE');
        expect(n.title).toBe('You are invited');
        expect(n.message).toBe('Join the team');
        expect(n.metadata).toEqual({ teamId: '1', teamName: 'Alpha' });
        expect(n.actions).toHaveLength(1);
        expect(n.isRead).toBe(false);
        expect(n.createdAt).toBeInstanceOf(Date);
    });

    it('falls back to default title when title is missing', () => {
        const [n] = adaptNotifications([{ id: 1, type: 'SYSTEM' }]);
        expect(n.title).toBe('Notification');
    });

    it('uses description as message fallback', () => {
        const [n] = adaptNotifications([{ id: 1, type: 'SYSTEM', description: 'from description' }]);
        expect(n.message).toBe('from description');
    });

    it('derives actions when actions field is absent', () => {
        const [n] = adaptNotifications([{ id: 1, type: 'TEAM_INVITE' }]);
        expect(n.actions.some((a) => a.key === 'accept')).toBe(true);
    });

    it('normalizes lowercase type strings', () => {
        const [n] = adaptNotifications([{ id: 1, type: 'team_invite' }]);
        expect(n.type).toBe('TEAM_INVITE');
    });

    it('falls back to SYSTEM for unknown types', () => {
        const [n] = adaptNotifications([{ id: 1, type: 'UNKNOWN_TYPE' }]);
        expect(n.type).toBe('SYSTEM');
    });

    it('treats isRead correctly from "read" alias', () => {
        const [n] = adaptNotifications([{ id: 1, read: true }]);
        expect(n.isRead).toBe(true);
    });

    it('sets createdAt to now when missing', () => {
        const before = Date.now();
        const [n] = adaptNotifications([{ id: 1, type: 'SYSTEM' }]);
        const after = Date.now();
        expect(n.createdAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(n.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('processes multiple items', () => {
        const result = adaptNotifications([
            { id: 1, type: 'SYSTEM' },
            { id: 2, type: 'FEATURE' },
            { id: 3, type: 'BILLING' },
        ]);
        expect(result).toHaveLength(3);
    });
});

describe('adaptInvitations', () => {
    it('returns an empty array when called with no arguments', () => {
        expect(adaptInvitations()).toEqual([]);
    });

    it('correctly converts a raw invitation', () => {
        const inv = {
            id: 99,
            token: 'tok-abc',
            role: 'member',
            team: { id: 'team1', name: 'DevTeam' },
            createdAt: '2024-01-01T00:00:00Z',
        };

        const [n] = adaptInvitations([inv]);
        expect(n.id).toBe('99');
        expect(n.type).toBe('TEAM_INVITE');
        expect(n.title).toContain('DevTeam');
        expect(n.message).toContain('DevTeam');
        expect(n.message).toContain('member');
        expect(n.metadata.token).toBe('tok-abc');
        expect(n.metadata.teamName).toBe('DevTeam');
        expect(n.metadata.role).toBe('member');
        expect(n.isRead).toBe(false);
        expect(n.actions.some((a) => a.key === 'accept')).toBe(true);
        expect(n.actions.some((a) => a.key === 'decline')).toBe(true);
    });

    it('handles missing team gracefully', () => {
        const [n] = adaptInvitations([{ id: 1, token: 'x' }]);
        expect(n.title).toContain('Unknown Team');
        expect(n.message).toContain('a team');
    });

    it('handles missing role gracefully', () => {
        const [n] = adaptInvitations([{ id: 1, token: 'x', team: { name: 'T' } }]);
        expect(n.message).not.toContain('as');
    });

    it('sets createdAt to now when missing', () => {
        const before = Date.now();
        const [n] = adaptInvitations([{ id: 1, token: 'x' }]);
        const after = Date.now();
        expect(n.createdAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(n.createdAt.getTime()).toBeLessThanOrEqual(after);
    });
});

describe('mergeNotifications', () => {
    const makeN = (id, offset = 0) => ({
        id: String(id),
        type: 'SYSTEM',
        title: `Notification ${id}`,
        message: '',
        metadata: {},
        actions: [],
        isRead: false,
        createdAt: new Date(Date.now() - offset * 1000),
    });

    it('returns empty array when given no sources', () => {
        expect(mergeNotifications()).toEqual([]);
    });

    it('returns empty array when all sources are empty', () => {
        expect(mergeNotifications([], [])).toEqual([]);
    });

    it('merges items from a single source', () => {
        const result = mergeNotifications([makeN(1), makeN(2)]);
        expect(result).toHaveLength(2);
    });

    it('de-duplicates by id (later source wins)', () => {
        const old = { ...makeN(1), title: 'Old' };
        const fresh = { ...makeN(1), title: 'Fresh' };
        const result = mergeNotifications([old], [fresh]);
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Fresh');
    });

    it('sorts result newest first', () => {
        const older = makeN('A', 120);
        const newer = makeN('B', 10);
        const result = mergeNotifications([older, newer]);
        expect(result[0].id).toBe('B');
        expect(result[1].id).toBe('A');
    });

    it('handles three sources', () => {
        const result = mergeNotifications([makeN(1)], [makeN(2)], [makeN(3)]);
        expect(result).toHaveLength(3);
    });

    it('handles empty sources mixed with populated ones', () => {
        const result = mergeNotifications([], [makeN(1)], [], [makeN(2)]);
        expect(result).toHaveLength(2);
    });
});

describe('deriveActions (via adaptNotifications)', () => {
    const adapt = (type) => adaptNotifications([{ id: 1, type }])[0].actions;

    it('TEAM_INVITE gets accept + decline actions', () => {
        const actions = adapt('TEAM_INVITE');
        expect(actions.some((a) => a.key === 'accept')).toBe(true);
        expect(actions.some((a) => a.key === 'decline')).toBe(true);
    });

    it('FEATURE gets a view action', () => {
        const actions = adapt('FEATURE');
        expect(actions.some((a) => a.key === 'view')).toBe(true);
    });

    it('SYSTEM gets a dismiss action', () => {
        const actions = adapt('SYSTEM');
        expect(actions.some((a) => a.key === 'dismiss')).toBe(true);
    });

    it('BILLING gets a dismiss action', () => {
        const actions = adapt('BILLING');
        expect(actions.some((a) => a.key === 'dismiss')).toBe(true);
    });

    it('TEAM_EVENT gets no derived actions (empty array)', () => {
        const actions = adapt('TEAM_EVENT');
        expect(actions).toEqual([]);
    });
});

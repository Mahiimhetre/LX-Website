/**
 * notificationAdapter.js
 *
 * Converts backend API responses into the unified frontend Notification schema.
 *
 * Unified schema:
 * {
 *   id        : string
 *   type      : 'TEAM_INVITE' | 'SYSTEM' | 'FEATURE' | 'TEAM_EVENT' | 'BILLING'
 *   title     : string
 *   message   : string
 *   metadata  : object   (teamId, teamName, token, role, etc.)
 *   actions   : [{ label, variant, key }]  — handlers wired in context
 *   isRead    : boolean
 *   createdAt : Date
 * }
 */

/**
 * Adapt a unified /api/v1/notifications response.
 * This is the primary adapter used once the backend exposes the general endpoint.
 *
 * @param {object[]} items  - raw notification objects from the API
 * @returns {object[]}      - normalized Notification[]
 */
export function adaptNotifications(items = []) {
    return items.map((item) => ({
        id: String(item.id),
        type: normalizeType(item.type),
        title: item.title || 'Notification',
        message: item.message || item.description || '',
        metadata: item.metadata || {},
        actions: Array.isArray(item.actions) ? item.actions : deriveActions(normalizeType(item.type)),
        isRead: Boolean(item.isRead ?? item.read ?? false),
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    }));
}

/**
 * Adapt the legacy /teams/pending/invitations response into unified schema.
 * Used as a fallback / supplementary source when the general endpoint isn't ready.
 *
 * @param {object[]} invitations  - raw invitation objects from the legacy endpoint
 * @returns {object[]}            - normalized Notification[]
 */
export function adaptInvitations(invitations = []) {
    return invitations.map((inv) => ({
        id: String(inv.id),
        type: 'TEAM_INVITE',
        title: `Team Invitation: ${inv.team?.name || 'Unknown Team'}`,
        message: `You've been invited to join ${inv.team?.name || 'a team'}${inv.role ? ` as ${inv.role}` : ''}.`,
        metadata: {
            teamId: inv.team?.id,
            teamName: inv.team?.name,
            token: inv.token,
            role: inv.role,
        },
        actions: [
            { label: 'Accept', variant: 'default', key: 'accept' },
            { label: 'Decline', variant: 'outline', key: 'decline' },
        ],
        isRead: false,
        createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
    }));
}

/**
 * Merge and de-duplicate notifications from multiple sources by id.
 * Later sources win on collision.
 *
 * @param  {...object[]} sources
 * @returns {object[]}
 */
export function mergeNotifications(...sources) {
    const map = new Map();
    for (const list of sources) {
        for (const n of list) {
            map.set(n.id, n);
        }
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeType(raw) {
    const map = {
        team_invite: 'TEAM_INVITE',
        TEAM_INVITE: 'TEAM_INVITE',
        system: 'SYSTEM',
        SYSTEM: 'SYSTEM',
        feature: 'FEATURE',
        FEATURE: 'FEATURE',
        team_event: 'TEAM_EVENT',
        TEAM_EVENT: 'TEAM_EVENT',
        billing: 'BILLING',
        BILLING: 'BILLING',
    };
    return map[raw] || 'SYSTEM';
}

function deriveActions(type) {
    switch (type) {
        case 'TEAM_INVITE':
            return [
                { label: 'Accept', variant: 'default', key: 'accept' },
                { label: 'Decline', variant: 'outline', key: 'decline' },
            ];
        case 'FEATURE':
            return [{ label: 'View Details', variant: 'outline', key: 'view' }];
        case 'SYSTEM':
        case 'BILLING':
            return [{ label: 'Acknowledge', variant: 'ghost', key: 'dismiss' }];
        default:
            return [];
    }
}

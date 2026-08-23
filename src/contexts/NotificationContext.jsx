import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { adaptNotifications, adaptInvitations, mergeNotifications } from '@/services/notificationAdapter';
import { toast } from 'sonner';

const NotificationContext = createContext(undefined);

const POLL_INTERVAL_MS = 30_000; // 30 seconds

/** Session-storage key for the invite modal, namespaced by userId to survive multi-account logins. */
const modalShownKey = (userId) => `notif-modal-shown:${userId}`;

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptingIds, setAcceptingIds] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const pollRef = useRef(null);

    // ── Derived ──────────────────────────────────────────────────────────────
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const pendingInvites = notifications.filter(
        (n) => n.type === 'TEAM_INVITE' && !n.isRead
    );

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // 1. Try the unified /notifications endpoint first
            let unified = [];
            try {
                const { data } = await apiClient.get('/notifications');
                if (data.success && Array.isArray(data.notifications)) {
                    unified = adaptNotifications(data.notifications);
                }
            } catch {
                // Endpoint not yet implemented — silently ignore
            }

            // 2. Always also pull legacy invitations so we never miss them
            let invitations = [];
            try {
                const { data } = await apiClient.get('/teams/pending/invitations');
                if (data.success && Array.isArray(data.invitations)) {
                    invitations = adaptInvitations(data.invitations);
                }
            } catch {
                // Silently ignore
            }

            // 3. Merge (de-duplicate by id, newest first)
            const merged = mergeNotifications(unified, invitations);
            setNotifications(merged);

            // 4. Auto-show modal once per session when pending invites exist
            const hasPendingInvites = merged.some((n) => n.type === 'TEAM_INVITE' && !n.isRead);
            if (hasPendingInvites && !sessionStorage.getItem(modalShownKey(user.id))) {
                setShowModal(true);
            }
        } catch (error) {
            console.error('[NotificationContext] fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // ── Polling ───────────────────────────────────────────────────────────────
    // Track previous userId so we can clear the modal flag when account switches.
    const prevUserIdRef = useRef(null);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setShowModal(false);
            clearInterval(pollRef.current);
            prevUserIdRef.current = null;
            return;
        }

        // If a different user just logged in, clear their per-user modal flag
        // so they get the invite modal on their first session too.
        if (prevUserIdRef.current && prevUserIdRef.current !== user.id) {
            sessionStorage.removeItem(modalShownKey(prevUserIdRef.current));
        }
        prevUserIdRef.current = user.id;

        fetchNotifications();
        pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(pollRef.current);
    }, [user, fetchNotifications]);

    // ── Actions ───────────────────────────────────────────────────────────────

    /**
     * Mark one notification as read (optimistic + backend persist).
     */
    const markAsRead = useCallback(async (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        try {
            await apiClient.patch(`/notifications/${id}/read`);
        } catch {
            // Endpoint may not exist yet — local state is still updated
        }
    }, []);

    /**
     * Mark all notifications as read.
     */
    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await apiClient.patch('/notifications/read-all');
        } catch {
            // Silently ignore if endpoint not yet available
        }
    }, []);

    /**
     * Dismiss (remove) a single notification — persisted to backend.
     */
    const dismissNotification = useCallback(async (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        try {
            await apiClient.delete(`/notifications/${id}`);
        } catch {
            // Silently ignore — local state already updated
        }
    }, []);

    /**
     * Accept a TEAM_INVITE notification.
     */
    const acceptInvite = useCallback(async (notification) => {
        const token = notification.metadata?.token;
        if (!token) return;

        setAcceptingIds((prev) => new Set([...prev, notification.id]));
        try {
            const { data } = await apiClient.post('/teams/accept-multiple', { tokens: [token] });
            if (data.success && data.results?.[0]?.success) {
                toast.success(`Joined ${notification.metadata?.teamName || 'the team'}!`);
                // Remove from local list immediately
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                // Best-effort: tell backend it's read so re-polling doesn't resurrect it
                try { await apiClient.patch(`/notifications/${notification.id}/read`); } catch { /* ignore */ }
            } else {
                toast.error(data.results?.[0]?.message || 'Failed to accept invitation');
            }
        } catch {
            toast.error('Error accepting invitation');
        } finally {
            setAcceptingIds((prev) => {
                const next = new Set(prev);
                next.delete(notification.id);
                return next;
            });
        }
    }, []);

    /**
     * Decline a TEAM_INVITE notification — dismisses locally and persists.
     */
    const declineInvite = useCallback(async (notification) => {
        await dismissNotification(notification.id);
        toast.info(`Invitation to ${notification.metadata?.teamName || 'the team'} declined.`);
    }, [dismissNotification]);

    /**
     * Close the modal and mark it as shown for this session.
     */
    const dismissModal = useCallback(() => {
        if (user?.id) sessionStorage.setItem(modalShownKey(user.id), '1');
        setShowModal(false);
    }, [user]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                pendingInvites,
                isLoading,
                acceptingIds,
                showModal,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                dismissNotification,
                acceptInvite,
                declineInvite,
                dismissModal,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

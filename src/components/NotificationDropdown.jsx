import { useRef } from 'react';
import { BellIcon, RotateCcwIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { toast } from 'sonner';

/**
 * NotificationDropdown
 *
 * A compact, absolute-positioned dropdown menu listing all notifications.
 * Sourced from NotificationContext.
 * Premium glassmorphic style.
 */
const NotificationDropdown = ({ isOpen, onClose, toggleRef }) => {
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAllAsRead,
    } = useNotifications();

    const dropdownRef = useRef(null);

    // Auto-close on click outside, ignoring clicks on the bell toggle button
    useOutsideClick(dropdownRef, (e) => {
        if (toggleRef?.current && toggleRef.current.contains(e.target)) {
            return;
        }
        if (isOpen) onClose();
    });

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className={cn(
                'absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl overflow-hidden z-[999]',
                'bg-black/60 backdrop-blur-2xl border border-white/10',
                'shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
                'animate-in fade-in slide-in-from-top-2 duration-200'
            )}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Notifications
                    </span>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary animate-pulse">
                            {unreadCount} new
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-white/5 font-medium"
                        >
                            Mark all read
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            await fetchNotifications();
                            toast.success('Notifications up to date', {
                                id: 'notif-refresh',
                                className: 'bg-black/80 backdrop-blur-xl border border-white/10 text-white text-xs',
                            });
                        }}
                        disabled={isLoading}
                        aria-label="Refresh notifications"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center"
                    >
                        <RotateCcwIcon
                            size={12}
                            className={cn(
                                'transition-transform duration-700',
                                isLoading && 'animate-spin'
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[320px] overflow-y-auto overflow-x-hidden p-2 space-y-2 scrollbar-none scrollbar-thin">
                {isLoading && notifications.length === 0 ? (
                    /* Loading skeleton items */
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="p-2 rounded-lg border border-white/5 bg-white/5 animate-pulse flex items-start gap-2"
                            >
                                <div className="w-6 h-6 rounded-lg bg-white/5 shrink-0" />
                                <div className="flex-1 space-y-1.5 py-0.5">
                                    <div className="h-2.5 bg-white/10 rounded w-1/3" />
                                    <div className="h-2 bg-white/5 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                        <div className="p-2 rounded-full bg-white/5 border border-white/10">
                            <BellIcon size={16} className="text-muted-foreground/45" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white">All caught up!</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                No new notifications
                            </p>
                        </div>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            compact={true}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && unreadCount > 0 && (
                <div className="px-3 py-2 border-t border-white/5 bg-white/5">
                    <button
                        onClick={markAllAsRead}
                        className="w-full text-center text-[10px] text-muted-foreground hover:text-white transition-colors py-1 hover:bg-white/5 rounded font-medium"
                    >
                        ✓ Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

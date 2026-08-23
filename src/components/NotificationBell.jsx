import { BellIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

/**
 * NotificationBell
 *
 * Reads unreadCount from the central NotificationContext.
 * No local state or API calls — the context owns the data.
 */
const NotificationBell = ({ onClick }) => {
    const { unreadCount } = useNotifications();

    return (
        <button
            id="notification-bell-btn"
            onClick={onClick}
            aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
            className={cn(
                'relative flex items-center justify-center p-2 rounded-lg',
                'transition-all duration-300 group outline-none focus:outline-none focus-visible:ring-0',
                'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30',
                'active:scale-95 hover:scale-105'
            )}
        >
            <BellIcon size={18} className="text-muted-foreground group-hover:text-white transition-colors" />

            {/* Unread badge */}
            {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-md animate-pulse" />
                    <div
                        className={cn(
                            'relative w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/80',
                            'flex items-center justify-center text-[10px] font-bold text-white',
                            'border border-white/20 shadow-lg',
                            'animate-in zoom-in scale-75 duration-300'
                        )}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                </div>
            )}
        </button>
    );
};

export default NotificationBell;

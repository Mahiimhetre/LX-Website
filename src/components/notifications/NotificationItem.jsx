import { Button } from '@/components/ui/button';
import {
    UsersIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    ZapIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    XIcon,
    Loader2Icon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

// ── Type → visual config ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
    TEAM_INVITE: {
        icon: UsersIcon,
        iconClass: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15',
        dot: 'bg-blue-400',
    },
    SYSTEM: {
        icon: ShieldCheckIcon,
        iconClass: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15',
        dot: 'bg-green-400',
    },
    FEATURE: {
        icon: ZapIcon,
        iconClass: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15',
        dot: 'bg-purple-400',
    },
    TEAM_EVENT: {
        icon: UsersIcon,
        iconClass: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15',
        dot: 'bg-cyan-400',
    },
    BILLING: {
        icon: CreditCardIcon,
        iconClass: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15',
        dot: 'bg-amber-400',
    },
};

const FALLBACK_CONFIG = {
    icon: AlertCircleIcon,
    iconClass: 'text-muted-foreground',
    bg: 'bg-white/5 border-white/10 hover:bg-white/8',
    dot: 'bg-muted-foreground',
};

/**
 * NotificationItem
 *
 * Renders a single notification card with icon, title, message,
 * action buttons (from notification.actions), timestamp, and
 * an unread indicator. Uses only existing UI components and tokens.
 */
const NotificationItem = ({ notification, compact = false }) => {
    const { acceptingIds, acceptInvite, declineInvite, dismissNotification, markAsRead } =
        useNotifications();

    const config = TYPE_CONFIG[notification.type] || FALLBACK_CONFIG;
    const Icon = config.icon;
    const isAccepting = acceptingIds.has(notification.id);

    const handleAction = (actionKey) => {
        switch (actionKey) {
            case 'accept':
                acceptInvite(notification);
                break;
            case 'decline':
                declineInvite(notification);
                break;
            case 'dismiss':
                dismissNotification(notification.id);
                break;
            case 'view':
                markAsRead(notification.id);
                break;
            default:
                dismissNotification(notification.id);
        }
    };

    const formattedTime = (() => {
        // Guard: coerce to Date if it somehow arrived as a string/number
        const raw = notification.createdAt;
        const date = raw instanceof Date ? raw : new Date(raw);
        if (isNaN(date.getTime())) return 'Unknown';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60_000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    })();

    return (
        <div
            role="listitem"
            onClick={() => { if (!notification.isRead) markAsRead(notification.id); }}
            className={cn(
                'group relative border transition-all duration-300 backdrop-blur-sm',
                compact ? 'p-2 rounded-lg' : 'p-4 rounded-xl',
                'hover:shadow-lg hover:shadow-primary/10',
                !notification.isRead && 'cursor-pointer',
                config.bg,
                !notification.isRead && 'ring-1 ring-inset ring-white/5'
            )}
        >
            {/* Dismiss X — top-right corner, appears on hover */}
            <button
                onClick={(e) => { e.stopPropagation(); dismissNotification(notification.id); }}
                aria-label="Dismiss notification"
                className="absolute top-2.5 right-2.5 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all duration-200 z-10"
            >
                <XIcon size={12} className="text-muted-foreground" />
            </button>

            {/* Unread dot — sits just inside top-right, below the dismiss X when it shows */}
            {!notification.isRead && (
                <span
                    className={cn(
                        'absolute top-3 right-8 w-2 h-2 rounded-full',
                        config.dot,
                        'animate-pulse'
                    )}
                />
            )}

            {/* Main content row */}
            <div className={cn('flex items-start', compact ? 'gap-2 mb-1.5' : 'gap-3 mb-3')}>
                {/* Icon */}
                <div className={cn('flex-shrink-0 mt-0.5 rounded-lg bg-black/20 border border-white/5', compact ? 'p-1' : 'p-1.5')}>
                    <Icon size={compact ? 12 : 16} className={config.iconClass} />
                </div>

                {/* Text */}
                <div className={cn('flex-1 min-w-0', compact ? 'pr-2' : 'pr-4')}>
                    <h3
                        className={cn(
                            'font-semibold text-white leading-tight',
                            compact ? 'text-xs' : 'text-sm'
                        )}
                    >
                        {notification.title}
                    </h3>
                    <p
                        className={cn(
                            'text-muted-foreground line-clamp-2',
                            compact ? 'text-[10px] leading-snug mt-0.5' : 'text-xs mt-0.5'
                        )}
                    >
                        {notification.message}
                    </p>
                </div>

            </div>

            {/* Action Buttons */}
            {notification.actions && notification.actions.length > 0 && (
                <div className={cn('flex gap-2', compact ? 'mt-1.5' : 'mt-3')}>
                    {notification.actions.map((action) => (
                        <Button
                            key={action.key}
                            size="sm"
                            variant={action.variant || 'outline'}
                            disabled={isAccepting}
                            onClick={() => handleAction(action.key)}
                            className={cn(
                                'flex-1 font-medium transition-all',
                                compact ? 'h-6.5 text-[10px] px-2.5' : 'h-8 text-xs',
                                action.variant === 'default' &&
                                    'bg-primary/80 hover:bg-primary border-primary/50',
                                action.variant === 'outline' &&
                                    'bg-transparent border-white/15 hover:bg-white/5',
                                action.variant === 'ghost' &&
                                    'bg-transparent hover:bg-white/5 border-transparent'
                            )}
                        >
                            {isAccepting && action.key === 'accept' ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2Icon size={compact ? 10 : 12} className="animate-spin" />
                                    Accepting…
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    {action.key === 'accept' && <CheckCircleIcon size={compact ? 10 : 12} />}
                                    {action.label}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>
            )}

            {/* Timestamp */}
            <p
                className={cn(
                    'text-muted-foreground/60 border-t border-white/5',
                    compact ? 'text-[8px] mt-1.5 pt-1.5' : 'text-[10px] mt-3 pt-3'
                )}
            >
                {formattedTime}
            </p>
        </div>
    );
};

export default NotificationItem;

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BellIcon, XIcon } from '@/components/icons';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import NotificationItem from '@/components/notifications/NotificationItem';

/**
 * NotificationModal
 *
 * Auto-shows once per session when the user has pending invitations.
 * Uses the existing Dialog component — no new UI patterns introduced.
 * Managed entirely via NotificationContext (showModal / dismissModal).
 */
const NotificationModal = () => {
    const { showModal, dismissModal, pendingInvites } = useNotifications();

    if (!showModal || pendingInvites.length === 0) return null;

    return (
        <Dialog
            open={showModal}
            onOpenChange={(open) => {
                if (!open) dismissModal();
            }}
        >
            <DialogContent
                className={cn(
                    'max-w-md w-full p-0 overflow-hidden',
                    'bg-black/60 backdrop-blur-2xl border border-white/10',
                    'shadow-[0_24px_64px_rgba(0,0,0,0.6)]',
                    'rounded-2xl'
                )}
            >
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-0">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                            <BellIcon size={18} className="text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold text-white leading-tight">
                                You have {pendingInvites.length} pending{' '}
                                {pendingInvites.length === 1 ? 'invitation' : 'invitations'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Accept or decline to continue
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Notification list */}
                <div className="px-6 py-4 space-y-3 max-h-[50vh] overflow-y-auto">
                    {pendingInvites.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            compact
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-muted-foreground/60 flex-1">
                        You can always manage these in the notification panel
                    </p>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={dismissModal}
                        className="text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 h-8 px-3"
                    >
                        <XIcon size={12} className="mr-1.5" />
                        Dismiss
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationModal;

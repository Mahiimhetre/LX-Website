import { BasePage } from './base.page.js';

export class NotificationsPage extends BasePage {
    get dropdownTrigger() { return '#notifications-trigger'; }
    get notificationList() { return '.notification-list'; }
    get notificationItems() { return '.notification-item'; }

    openNotifications() {
        this.click(this.dropdownTrigger);
    }

    getNotificationCount() {
        return this.getElements(this.notificationItems).length;
    }

    clickAction(itemId, actionKey) {
        const actionBtn = this.getElement(`.notification-item[data-id="${itemId}"] button[data-action="${actionKey}"]`);
        if (actionBtn) {
            actionBtn.click();
        }
    }
}

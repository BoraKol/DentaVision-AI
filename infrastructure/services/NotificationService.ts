/**
 * NotificationService - Handles browser notifications
 */

class NotificationService {
    private permissionGranted: boolean = false;

    constructor() {
        this.checkPermission();
    }

    /**
     * Check current notification permission status
     */
    private checkPermission(): void {
        if ('Notification' in window) {
            this.permissionGranted = Notification.permission === 'granted';
        }
    }

    /**
     * Request notification permission from user
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permissionGranted = permission === 'granted';
            return this.permissionGranted;
        }

        return false;
    }

    /**
     * Check if notifications are enabled
     */
    isEnabled(): boolean {
        return 'Notification' in window && this.permissionGranted;
    }

    /**
     * Get current permission status
     */
    getPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
        if (!('Notification' in window)) {
            return 'unsupported';
        }
        return Notification.permission;
    }

    /**
     * Show a browser notification
     */
    show(title: string, options?: NotificationOptions): void {
        if (!this.isEnabled()) {
            console.warn('Notifications not enabled');
            return;
        }

        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    /**
     * Schedule a notification for appointment reminder
     */
    scheduleAppointmentReminder(
        patientName: string,
        procedure: string,
        date: Date,
        time: string,
        minutesBefore: number = 30
    ): NodeJS.Timeout | null {
        const appointmentTime = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        appointmentTime.setHours(hours, minutes, 0, 0);

        const reminderTime = appointmentTime.getTime() - minutesBefore * 60 * 1000;
        const now = Date.now();

        if (reminderTime <= now) {
            // Appointment is in the past or reminder time has passed
            return null;
        }

        const delay = reminderTime - now;

        return setTimeout(() => {
            this.show(`Randevu Hatırlatması - ${patientName}`, {
                body: `${procedure} için randevu ${minutesBefore} dakika içinde başlayacak.`,
                tag: `appointment-${date.toISOString()}-${time}`,
                requireInteraction: true
            });
        }, delay);
    }

    /**
     * Show appointment reminder immediately
     */
    showAppointmentReminder(patientName: string, procedure: string, time: string): void {
        this.show(`Yaklaşan Randevu`, {
            body: `${patientName} - ${procedure}\nSaat: ${time}`,
            tag: 'appointment-reminder'
        });
    }

    /**
     * Show treatment follow-up reminder
     */
    showFollowUpReminder(patientName: string, procedure: string): void {
        this.show(`Takip Hatırlatması`, {
            body: `${patientName} için ${procedure} takibi gerekiyor.`,
            tag: 'follow-up-reminder'
        });
    }
}

export const notificationService = new NotificationService();

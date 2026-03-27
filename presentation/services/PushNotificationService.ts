/**
 * PushNotificationService (No-op)
 * Capacitor bağımlılıkları kaldırıldığı için bu servis artık işlevsizdir.
 * Derleme hatası almamak için placeholder olarak tutulmaktadır.
 */

export class NotificationService {
    private static instance: NotificationService;

    private constructor() { }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public async init() {
        // console.log('Push notifications disabled (Mobile module removed)');
        return Promise.resolve();
    }
}

export const notificationService = NotificationService.getInstance();

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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
        if (Capacitor.getPlatform() === 'web') {
            // console.log('Push notifications not supported on web');
            return;
        }

        try {
            await this.registerNotifications();
            this.addListeners();
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    private async registerNotifications() {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.error('User denied permissions!');
            return;
        }

        await PushNotifications.register();
    }

    private addListeners() {
        PushNotifications.addListener('registration', token => {
            console.log('Push registration success, token: ' + token.value);
            // TODO: Send token to backend
        });

        PushNotifications.addListener('registrationError', error => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', notification => {
            console.log('Push received: ' + JSON.stringify(notification));
            // TODO: Show local toast or dialog if app is in foreground
        });

        PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            console.log('Push action performed: ' + JSON.stringify(notification));
            // TODO: Navigate to specific screen based on notification data
        });
    }
}

export const notificationService = NotificationService.getInstance();

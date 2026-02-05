const notificationService = require('./services/NotificationService');

async function testEmail() {
    console.log('Testing SMTP Connection...');
    const result = await notificationService.sendEmail(
        process.env.TEST_EMAIL || process.env.SMTP_USER, // Send to self if no test email
        'SMTP Test Email 📧',
        '<h1>It Works!</h1><p>This is a test email from DentaVision AI.</p>'
    );
    console.log('Result:', result);
}

testEmail();

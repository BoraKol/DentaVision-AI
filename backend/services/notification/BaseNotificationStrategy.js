/**
 * Base Notification Strategy (Interface)
 */
class BaseNotificationStrategy {
    /**
     * @param {string} recipient - Phone, Email, etc.
     * @param {string} message - Content
     * @param {Object} metadata - Extra info (patientId, etc.)
     */
    async send(recipient, message, metadata = {}) {
        throw new Error('Method "send" must be implemented');
    }

    /**
     * @returns {string} - Strategy identifier
     */
    get name() {
        throw new Error('Property "name" must be implemented');
    }
}

module.exports = BaseNotificationStrategy;

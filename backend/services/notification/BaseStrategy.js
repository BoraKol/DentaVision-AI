class BaseStrategy {
    async send(recipient, message, options = {}) {
        throw new Error('Method "send()" must be implemented');
    }
}

module.exports = BaseStrategy;

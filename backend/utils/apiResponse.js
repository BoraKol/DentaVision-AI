/**
 * Standard API Response Formatter
 */
const sendResponse = (res, statusCode, data, message = 'Success') => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Standard API Error Formatter
 */
const sendError = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = { sendResponse, sendError };

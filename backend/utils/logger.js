const winston = require('winston');

// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Define log formats
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
);

// Create the logger
const logger = winston.createLogger({
    level: level,
    format: logFormat,
    transports: [
        // Always log to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true })
            )
        }),
        // Log errors to a file
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.uncolorize()
        }),
        // Log all messages to a combined file
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.uncolorize()
        })
    ]
});

module.exports = logger;

require('dotenv').config();
const sanitizeEnv = require('./utils/envSanitizer');
// Run env sanitization before starting the server
sanitizeEnv();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');


const path = require('path'); // Add path module
const logger = require('./utils/logger'); // Import Winston logger

// Initializations
const loadRoutes = require('./utils/routeLoader');
const setupReminders = require('./cron/reminderCron');

// Initialize database
connectDB();

// Initialize Cron Jobs
setupReminders();

// Initialize Event Subscribers
require('./subscribers/notificationSubscriber');

const app = express();

// HTTP Request Logger Middleware
const morgan = require('morgan');
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parser with size limit (Security: prevent large payload DDoS)
app.use(express.json({ limit: '1mb' }));

// Security Middleware
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');

// Enable CORS with environment-based whitelist
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-branch', 'x-clinic']
}));

// Set security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Prevent NoSQL injection
app.use((req, res, next) => {
    req.body = mongoSanitize(req.body);
    req.query = mongoSanitize(req.query);
    req.params = mongoSanitize(req.params);
    next();
});

// Prevent HTTP Param Pollution
app.use(hpp());

// Data sanitization against XSS
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // 100 requests per window
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 20, // 20 requests per window
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount all routers dynamically
loadRoutes(app);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🦷 DentaVision Backend running on port ${PORT}`);
    logger.info(`🦷 DentaVision Backend running on port ${PORT}`);
});

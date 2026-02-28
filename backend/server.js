require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const path = require('path'); // Add path module

// Initialize database
connectDB();

const loadRoutes = require('./utils/routeLoader');

// Initialize Cron Jobs
const setupReminders = require('./cron/reminderCron');
setupReminders();

// Initialize Event Subscribers
require('./subscribers/notificationSubscriber');

const app = express();

// Body parser
app.use(express.json());

// Security Middleware
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for testing/deployment but log them
        // In a real production app, we would use a whitelist
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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
});

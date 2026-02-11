require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const path = require('path'); // Add path module

// Route files
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const photoRoutes = require('./routes/photos');

// Connect to database
connectDB();

// Initialize Cron Jobs
const setupReminders = require('./cron/reminderCron');
setupReminders();

const app = express();

// Body parser
app.use(express.json());

// Security Middleware
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

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

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // 100 requests per window
});
app.use('/api', limiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/financials', require('./routes/financials'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/lab-jobs', require('./routes/labJobs'));
app.use('/api/portal', require('./routes/patientPortal'));
app.use('/api/enabiz', require('./routes/enabiz'));

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

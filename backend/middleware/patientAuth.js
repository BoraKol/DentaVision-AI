const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

exports.protectPatient = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Fix: Split by space, not empty string
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.error('[Patient Auth] No token provided');
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.patient = await Patient.findById(decoded.id);

        if (!req.patient) {
            console.error(`[Patient Auth] Patient not found for ID: ${decoded.id}`);
            return res.status(401).json({ success: false, message: 'No patient found with this id' });
        }

        next();
    } catch (err) {
        console.error('[Patient Auth] Verification failed:', err.message);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

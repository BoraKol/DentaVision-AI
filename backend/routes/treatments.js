const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { protectPatient } = require('../middleware/patientAuth');

// Middleware to allow either Admin/Doctor (protect) or the specific Patient (protectPatient)
const protectOrPatient = async (req, res, next) => {
    // Try patient auth first if header has token
    if (req.headers.authorization) {
        // We need to differentiate or try both.
        // Simple strategy: Try protectPatient. If it fails (next with error or response), try protect? 
        // Better: Check token payload or just try one then the other.
        // actually, protectPatient sets req.patient, protect sets req.user.
        
        // Let's manually invoke middleware logic or use a combined approach.
        // Since express middleware chaining is linear, we can't easily "try catch" a middleware.
        
        // Alternative: Custom logic here.
        // Check if token belongs to patient
        const jwt = require('jsonwebtoken');
        try {
             const token = req.headers.authorization.split(' ')[1];
             if (!token) return res.status(401).json({ message: 'No token' });
             
             const decoded = jwt.verify(token, process.env.JWT_SECRET);
             
             if (decoded.role === 'patient') {
                 // It's a patient, use protectPatient logic
                 return protectPatient(req, res, next);
             } else {
                 // It's a user, use protect logic
                 return protect(req, res, next);
             }
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized' });
    }
};

const {
    getTreatments,
    createTreatment,
    updateTreatmentStatus,
    deleteTreatment
} = require('../controllers/treatmentController');

// Public routes (none)

// Protected routes
router.get('/:patientId', protectOrPatient, getTreatments); // Allow both
router.post('/', protect, createTreatment); // Only doctors create
router.patch('/:id', protect, updateTreatmentStatus); // Only doctors update status (usually)
router.delete('/:id', protect, deleteTreatment); // Only doctors delete

module.exports = router;

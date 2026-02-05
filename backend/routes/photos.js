const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Photo = require('../models/Photo');
const { protect } = require('../middleware/auth');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: patientId-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// @desc    Upload a photo
// @route   POST /api/photos
// @access  Private
router.post('/', protect, (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g. File too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File is too large. Max limit is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { patientId, type, notes } = req.body;

        if (!patientId) {
            // Clean up uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        const photo = await Photo.create({
            patientId,
            url: `/uploads/${req.file.filename}`,
            type: type || 'other',
            notes,
            uploadedBy: req.user._id,
            clinicName: req.user.clinicName // For clinic isolation
        });

        res.status(201).json(photo);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get photos for a patient
// @route   GET /api/photos/patient/:patientId
// @access  Private
router.get('/patient/:patientId', protect, async (req, res) => {
    try {
        const photos = await Photo.find({
            patientId: req.params.patientId,
            clinicName: req.user.clinicName // Enforcement of clinic isolation
        }).sort({ createdAt: -1 });

        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a photo
// @route   DELETE /api/photos/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const photo = await Photo.findOne({
            _id: req.params.id,
            clinicName: req.user.clinicName
        });

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', photo.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await photo.deleteOne(); // or findOneAndDelete

        res.json({ message: 'Photo removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

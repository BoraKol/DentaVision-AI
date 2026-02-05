const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getTreatments,
    createTreatment,
    updateTreatmentStatus,
    deleteTreatment
} = require('../controllers/treatmentController');

// All routes are protected
router.use(protect);

router.get('/:patientId', getTreatments);
router.post('/', createTreatment);
router.patch('/:id', updateTreatmentStatus);
router.delete('/:id', deleteTreatment);

module.exports = router;

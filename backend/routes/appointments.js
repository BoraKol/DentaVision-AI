const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAppointments,
    getAppointmentsByDate,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');

const validate = require('../middleware/validate');
const { createAppointmentSchema, updateAppointmentSchema } = require('../validators/appointmentValidator');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getAppointments)
    .post(validate(createAppointmentSchema), createAppointment);

router.get('/date/:date', getAppointmentsByDate);

router.route('/:id')
    .get(getAppointment)
    .put(validate(updateAppointmentSchema), updateAppointment)
    .delete(deleteAppointment);

module.exports = router;

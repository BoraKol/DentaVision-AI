const express = require('express');
const router = express.Router();
const {
    getLabJobs,
    createLabJob,
    updateLabJob,
    deleteLabJob
} = require('../controllers/labJobController');

const validate = require('../middleware/validate');
const { createLabJobSchema, updateLabJobSchema } = require('../validators/labJobValidator');

// Main routes
router.route('/')
    .get(getLabJobs)
    .post(validate(createLabJobSchema), createLabJob);

// Single item routes
router.route('/:id')
    .put(validate(updateLabJobSchema), updateLabJob)
    .delete(deleteLabJob);

module.exports = router;

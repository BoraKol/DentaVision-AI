const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

exports.protectPatient = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split('')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.patient = await Patient.findById(decoded.id);

        if (!req.patient) {
            return res.status(401).json({ success: false, message: 'No patient found with this id' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

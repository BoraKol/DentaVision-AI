const BaseRepository = require('./BaseRepository');
const Appointment = require('../models/Appointment');

class AppointmentRepository extends BaseRepository {
    constructor() {
        super(Appointment);
    }
}

module.exports = new AppointmentRepository();

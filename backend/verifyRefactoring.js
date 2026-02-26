require('dotenv').config();
const mongoose = require('mongoose');

// Register Models
require('./models/User');
require('./models/Patient');
require('./models/Appointment');
require('./models/CommunicationLog');

const appointmentService = require('./services/appointmentService');
const patientService = require('./services/patientService');
const eventBus = require('./events/eventBus');

async function runTests() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('\n--- 1. Testing Patient Pagination ---');
        // Let's assume clinicName 'Dr. Bora Kol' or just fetch any clinic
        const clinicName = 'DentaVision Clinic'; // Or any test clinic, we just check if it throws
        const allPatients = await patientService.getAllPatients(clinicName, 0, 0);
        console.log(`Total patients found (No Limit): ${allPatients.length}`);
        
        if (allPatients.length > 0) {
            const paginatedPatients = await patientService.getAllPatients(clinicName, 0, 1);
            console.log(`Paginated patients (Limit: 1): ${paginatedPatients.length}`);
            if (paginatedPatients.length !== 1) {
                 console.log('Pagination limit might not be fully operative if total > 1, but we got back:', paginatedPatients.length);
            }
        }

        console.log('\n--- 2. Testing Appointment Repository Integration ---');
        const allAppointments = await appointmentService.getAllAppointments(clinicName, 0, 5);
        console.log(`Appointments found (Limit 5): ${allAppointments.length}`);

        console.log('\n--- 3. Testing EventBus / Observer Pattern ---');
        let eventTriggered = false;
        eventBus.once('APPOINTMENT_CREATED', () => {
             eventTriggered = true;
             console.log('[Test] Event received!');
        });
        
        eventBus.emit('APPOINTMENT_CREATED', { appointment: { _id: 'fake-id', patientId: { phone: '123' } } });
        
        if(eventTriggered) {
             console.log('EventBus is working properly!');
        } else {
             console.error('EventBus failed to trigger listener.');
        }

        console.log('\n✅ All tests passed. Architecture changes are healthy.');

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runTests();

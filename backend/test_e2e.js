const http = require('http');

const API_URL = 'http://localhost:3001/api';

const request = (method, path, data = null, token = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                let parsed = body;
                try { parsed = JSON.parse(body); } catch (e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

async function runE2ETests() {
    console.log('--- Starting E2E Tests ---');
    try {
        const timestamp = Date.now();
        const testUser = {
            name: `Test Dr ${timestamp}`,
            email: `test${timestamp}@dentavision.com`,
            password: 'Password123!',
            clinicName: `Test Clinic ${timestamp}`,
            title: 'Dt.'
        };

        // 1. Register User
        console.log('1. Registering new user...');
        const regRes = await request('POST', '/auth/register', testUser);
        if (regRes.status !== 201) throw new Error(`Register failed: ${JSON.stringify(regRes.data)}`);
        const token = regRes.data.token;
        console.log('✅ User registered successfully. Token received.');

        // 2. Create Patient
        console.log('\n2. Creating a patient...');
        const testPatient = {
            name: `Patient ${timestamp}`,
            age: 30,
            gender: 'male',
            phone: '5551234567'
        };
        const createPatRes = await request('POST', '/patients', testPatient, token);
        if (createPatRes.status !== 201) throw new Error(`Create patient failed: ${JSON.stringify(createPatRes.data)}`);
        const patientId = createPatRes.data._id;
        console.log(`✅ Patient created. ID: ${patientId}`);

        // 3. Get Patients (Pagination Test)
        console.log('\n3. Fetching patients with pagination...');
        const getPatRes = await request('GET', '/patients?page=1&limit=1', null, token);
        if (getPatRes.status !== 200 || !Array.isArray(getPatRes.data)) throw new Error(`Get patients failed: ${JSON.stringify(getPatRes.data)}`);
        console.log(`✅ Patients fetched. Count: ${getPatRes.data.length}`);

        // 4. Create Appointment
        console.log('\n4. Creating an appointment...');
        const testAppt = {
            patientId: patientId,
            date: '2026-10-10',
            time: '14:30',
            procedure: 'Routine Checkup'
        };
        const createApptRes = await request('POST', '/appointments', testAppt, token);
        if (createApptRes.status !== 201) throw new Error(`Create appointment failed: ${JSON.stringify(createApptRes.data)}`);
        console.log('✅ Appointment created successfully.');

        // 5. Get Appointments
        console.log('\n5. Fetching appointments...');
        const getApptRes = await request('GET', '/appointments?page=1&limit=10', null, token);
        if (getApptRes.status !== 200 || !Array.isArray(getApptRes.data)) throw new Error(`Get appointments failed: ${JSON.stringify(getApptRes.data)}`);
        console.log(`✅ Appointments fetched. Count: ${getApptRes.data.length}`);

        console.log('\n🎉 All E2E Tests Passed Successfully! Application APIs are healthy.');
    } catch (err) {
        console.error('\n❌ E2E Test Failed:', err.message);
    }
}

runE2ETests();

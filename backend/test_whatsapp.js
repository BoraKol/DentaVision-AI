require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');

require('./models/Patient');
const Patient = mongoose.model('Patient');

const connectDB = require('./config/db');

const testWebhook = async () => {
    // 1. connect DB
    await connectDB();
    
    // 2. find a realistic patient
    let patient = await Patient.findOne({ phone: { $exists: true, $ne: '' } });
    
    if(!patient) {
       console.log("No patient with phone found. Let's create one.");
       patient = await Patient.create({
           name: "Ahmet Testoğlu",
           email: "ahmet@test.com",
           phone: "+905559998877",
           age: 35,
           gender: "male",
           // Added missing required fields based on schema, or simple
       });
    }

    console.log(`Using patient: ${patient.name} (${patient.phone})`);

    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            phoneNumber: patient.phone,
            message: 'Merhaba, kanal tedavisi olduğum dişimde zonklayan bir ağrı var. Ne yapmalıyım?'
        });

        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/whatsapp/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
};

console.log("🚀 Testing WhatsApp Webhook with a real Patient...");
testWebhook()
    .then(result => {
        console.log(`Response Status: ${result.status}`);
        console.log(`Response Body: ${result.data}`);
        console.log("✅ Check backend terminal logs for AI response!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Test failed:", err);
        process.exit(1);
    });

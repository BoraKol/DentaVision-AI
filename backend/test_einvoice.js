const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Transaction = require('./models/Transaction');
const Patient = require('./models/Patient');
const connectDB = require('./config/db');

// Setup environment
dotenv.config();

// Create mock Req/Res to test controller logic directly, or just use EInvoiceService
const EInvoiceService = require('./services/EInvoiceService');

async function runTest() {
    try {
        console.log("-----------------------------------------");
        console.log("🧾 E-INVOICE INTEGRATION VERIFICATION");
        console.log("-----------------------------------------");

        await connectDB();

        // 1. Create a dummy patient
        console.log("1. Creating a dummy patient...");
        const patient = await Patient.create({
            name: "Fatura Test Hastası",
            phone: "+90 555 444 33 22",
            tcNo: "12345678901",
            clinicName: "DentaVision Demo",
            userId: new mongoose.Types.ObjectId()
        });

        // 2. Create a dummy INCOME transaction
        console.log("2. Creating a dummy transaction...");
        const transaction = await Transaction.create({
            type: "INCOME",
            amount: 5000,
            category: "Kanal Tedavisi",
            paymentMethod: "CREDIT_CARD",
            patientId: patient._id,
            clinicName: "DentaVision Demo",
            description: "Test E-Fatura Kesimi İçin",
            invoiceStatus: "PENDING"
        });

        console.log(`✅ Transaction created: ${transaction._id} (Pending)`);

        // 3. Generate E-Invoice using the Service
        console.log("3. Calling EInvoiceService to generate invoice...");
        const invoiceData = await EInvoiceService.generateInvoice(transaction, patient);

        console.log(`✅ Service returned:`, invoiceData);

        // 4. Update the DB as the controller would
        transaction.invoiceStatus = invoiceData.status;
        transaction.invoiceId = invoiceData.invoiceId;
        transaction.invoiceDocumentUrl = invoiceData.documentUrl;
        await transaction.save();

        console.log("4. Verifying DB update...");
        const updatedTx = await Transaction.findById(transaction._id);
        
        if (updatedTx.invoiceStatus === 'GENERATED' && updatedTx.invoiceId.startsWith('EFAT')) {
            console.log("🎉 TEST PASSED: E-Invoice generated and saved successfully!");
            console.log(`🔗 PDF URL: ${updatedTx.invoiceDocumentUrl}`);
        } else {
            console.log("❌ TEST FAILED: DB not updated correctly.", updatedTx);
        }

        // Cleanup
        await Transaction.findByIdAndDelete(transaction._id);
        await Patient.findByIdAndDelete(patient._id);
        console.log("🧹 Cleanup complete.");

    } catch (error) {
        console.error("❌ Test encountered an error:", error);
    } finally {
        process.exit(0);
    }
}

runTest();

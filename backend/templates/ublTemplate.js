/**
 * Generates a mock UBL-TR XML format for E-SMM (Serbest Meslek Makbuzu)
 */
module.exports = (data) => {
    const { 
        invoiceId, 
        date, 
        clinicName, 
        patientName, 
        patientTc, 
        total 
    } = data;

    const time = new Date().toLocaleTimeString('tr-TR');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
    <cbc:ProfileID>E-SMM</cbc:ProfileID>
    <cbc:ID>${invoiceId}</cbc:ID>
    <cbc:CopyIndicator>false</cbc:CopyIndicator>
    <cbc:IssueDate>${date}</cbc:IssueDate>
    <cbc:IssueTime>${time}</cbc:IssueTime>
    <cbc:InvoiceTypeCode>SERBEST_MESLEK_MAKBUZU</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
    <cbc:LineCountNumeric>1</cbc:LineCountNumeric>
    
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>${clinicName}</cbc:Name>
            </cac:PartyName>
            <cac:Contact>
                <cbc:ElectronicMail>info@dentavision.com</cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingSupplierParty>
    
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="TCKN">${patientTc || '11111111111'}</cbc:ID>
            </cac:PartyIdentification>
            <cac:Person>
                <cbc:FirstName>${patientName.split(' ')[0]}</cbc:FirstName>
                <cbc:FamilyName>${patientName.split(' ').slice(1).join(' ')}</cbc:FamilyName>
            </cac:Person>
        </cac:Party>
    </cac:AccountingCustomerParty>

    <cac:LegalMonetaryTotal>
        <cbc:PayableAmount currencyID="TRY">${total.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>`;
};

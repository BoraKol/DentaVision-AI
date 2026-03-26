const inventoryRepository = require('../repositories/InventoryRepository');

class InventoryService {
    async getAllItems(clinicName, sort = { name: 1 }) {
        return await inventoryRepository.findAll({ clinicName }, '', sort);
    }

    async getItemById(id, clinicName) {
        return await inventoryRepository.findOne({ _id: id, clinicName });
    }

    async createItem(data) {
        return await inventoryRepository.create(data);
    }

    async updateItem(id, clinicName, data) {
        const item = await inventoryRepository.findOne({ _id: id, clinicName });
        if (!item) return null;

        return await inventoryRepository.update({ _id: id }, data);
    }

    async deleteItem(id, clinicName) {
        const item = await inventoryRepository.findOne({ _id: id, clinicName });
        if (!item) return null;

        await inventoryRepository.delete({ _id: id });
        return true;
    }

    async addTransaction(id, clinicName, transactionData) {
        const item = await inventoryRepository.findOne({ _id: id, clinicName });
        if (!item) {
            throw new Error('Item not found');
        }

        const { type, amount, note, performedBy } = transactionData;
        
        let newQuantity = item.quantity;
        const numAmount = Number(amount);

        if (type === 'IN') {
            newQuantity += numAmount;
        } else if (type === 'OUT') {
            if (newQuantity < numAmount) {
                throw new Error('Insufficient stock');
            }
            newQuantity -= numAmount;
        } else if (type === 'ADJUST') {
            newQuantity = numAmount;
        }

        const transaction = {
            type,
            amount: numAmount,
            note,
            performedBy,
            date: Date.now()
        };

        return await inventoryRepository.update(
            { _id: id },
            {
                quantity: newQuantity,
                $push: { transactions: transaction }
            }
        );
    }
}

module.exports = new InventoryService();

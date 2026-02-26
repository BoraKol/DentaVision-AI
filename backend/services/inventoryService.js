const inventoryRepository = require('../repositories/InventoryRepository');

class InventoryService {
    async getAllItems(sort = { name: 1 }) {
        return await inventoryRepository.findAll({}, '', sort);
    }

    async getItemById(id) {
        return await inventoryRepository.findById(id);
    }

    async createItem(data) {
        return await inventoryRepository.create(data);
    }

    async updateItem(id, data) {
        const item = await inventoryRepository.findById(id);
        if (!item) return null;

        return await inventoryRepository.update({ _id: id }, data);
    }

    async deleteItem(id) {
        const item = await inventoryRepository.findById(id);
        if (!item) return null;

        await inventoryRepository.delete({ _id: id });
        return true;
    }

    async addTransaction(id, transactionData) {
        const item = await inventoryRepository.findById(id);
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

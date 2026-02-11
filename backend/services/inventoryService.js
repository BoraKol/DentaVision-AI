const InventoryItem = require('../models/InventoryItem');

class InventoryService {
    async getAllItems(sort = { name: 1 }) {
        return await InventoryItem.find().sort(sort);
    }

    async getItemById(id) {
        return await InventoryItem.findById(id);
    }

    async createItem(data) {
        return await InventoryItem.create(data);
    }

    async updateItem(id, data) {
        const item = await InventoryItem.findById(id);
        if (!item) return null;

        return await InventoryItem.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    }

    async deleteItem(id) {
        const item = await InventoryItem.findById(id);
        if (!item) return null;

        await item.deleteOne();
        return true;
    }

    async addTransaction(id, transactionData) {
        const item = await InventoryItem.findById(id);
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

        item.quantity = newQuantity;
        item.transactions.push({
            type,
            amount: numAmount,
            note,
            performedBy,
            date: Date.now()
        });

        return await item.save();
    }
}

module.exports = new InventoryService();

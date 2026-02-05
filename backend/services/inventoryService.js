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
}

module.exports = new InventoryService();

const BaseRepository = require('./BaseRepository');
const InventoryItem = require('../models/InventoryItem');

class InventoryRepository extends BaseRepository {
    constructor() {
        super(InventoryItem);
    }
}

module.exports = new InventoryRepository();

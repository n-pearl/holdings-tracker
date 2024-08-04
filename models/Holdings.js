
const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
    name: String,
    type: String, // 'stock' or 'crypto'
    user: String
});

module.exports = mongoose.model('Holding', HoldingSchema);

const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    symbol: { type: String, required: true }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    holdings: [HoldingSchema]
});

module.exports = mongoose.model('User', UserSchema);

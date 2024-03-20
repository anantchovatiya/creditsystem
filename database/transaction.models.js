const mongoose = require("mongoose");
const TransactionSchema = mongoose.Schema({
    amt: {
        type: Number,
        required: true
    },
    to: {
        type: Number,
        required: true
    },
    from: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Transactions', TransactionSchema);
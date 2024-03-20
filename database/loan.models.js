const mongoose = require("mongoose");

const loanSchema = mongoose.Schema({
    accno: {
        type: Number
    },
    amt: {
        type: Number
    },
    month: {
        type: Number
    },
    type: {
        type: String
    }

})

const loan = mongoose.model("Loan", loanSchema);
module.exports = loan;
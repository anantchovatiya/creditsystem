const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    accountno: {
        type: Number,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[6-9]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid Indian mobile number!`

        }
    }
}, { timestamps: true });
const user = mongoose.model("user", userschema);

module.exports = user;
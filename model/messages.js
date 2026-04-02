const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    Sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    Receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Messages', MessageSchema);
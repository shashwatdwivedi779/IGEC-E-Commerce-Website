const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({

    username: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "others"]
    },

    password: {
        type: String,
        required: true
    },

    yourproducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],

    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],

    Bugs: [{
        type: String,
    }],

    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],

    owner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }]
    
})

module.exports = mongoose.model('Users', UserSchema);
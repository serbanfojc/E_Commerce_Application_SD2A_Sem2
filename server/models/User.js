const mongoose = require('mongoose');

let usersSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },

        email: { 
            type: String, 
            required: true,
            unique: true,
            lowercase: true 
        },

        password: { 
            type: String, 
            required: true 
        },
        
        accessLevel: { 
            type: Number, 
            default: 1  
        },
        
        profilePhotoFilename: { 
            type: String, 
            default: "" 
        }
    },
    {
        collection: 'users'
    }
);

module.exports = mongoose.model('User', usersSchema);
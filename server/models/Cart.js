const mongoose = require('mongoose');

let cartItemSchema = new mongoose.Schema
(
    {
        productId: 
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required']
        },

        quantity: 
        { 
            type: Number, 
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
            default: 1
        },

        price: 
        { 
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },

        name: 
        { 
            type: String,
            required: [true, 'Product name is required']
        },

        imageFilename: 
        { 
            type: String,
            default: ''
        }
    },

    {
        _id: true 
    }
);

let cartSchema = new mongoose.Schema
(
    {
        userId: 
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            sparse: true, 
            index: true     
        },
        
        sessionId: 
        { 
            type: String,
            sparse: true,
            index: true
        },
        
        items: [cartItemSchema],
        
        subtotal: 
        {
            type: Number,
            default: 0,
            min: 0
        },
        
        tax: 
        {
            type: Number,
            default: 0,
            min: 0
        },
        
        total:
        {
            type: Number,
            default: 0,
            min: 0
        },
        
        isActive: 
        {
            type: Boolean,
            default: true
        },
        
        createdAt:
        {
            type: Date,
            default: Date.now
        },
        
        updatedAt: 
        {
            type: Date,
            default: Date.now
        }
    },

    {
        collection: 'carts'
    }
);

module.exports = mongoose.model('Cart', cartSchema);
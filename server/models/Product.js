const mongoose = require('mongoose');

let productPhotosSchema = new mongoose.Schema(
    {
        filename: { 
            type: String, 
            required: true 
        },
        
        description: { 
            type: String, 
            default: "" 
        }
    }
);

let productSchema = new mongoose.Schema(
    {
        
        name: { 
            type: String, 
            required: [true, 'Product name is required'],
            minlength: [3, 'Product name must be at least 3 characters'],
            maxlength: [100, 'Product name cannot exceed 100 characters'],
            trim: true  
        },
        
        description: { 
            type: String, 
            required: [true, 'Product description is required'],
            minlength: [10, 'Description must be at least 10 characters']
        },
        
        price: { 
            type: Number, 
            required: [true, 'Price is required'],
            min: [0.01, 'Price must be greater than 0'],
            max: [1000000, 'Price cannot exceed 1,000,000']
        },
        
        category: { 
            type: String, 
            required: [true, 'Category is required'],
            enum: {
                values: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'],
                message: '{VALUE} is not a valid category'
            }
        },
        
        stock: { 
            type: Number, 
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        
        photos: [productPhotosSchema],  
        
        sold: { 
            type: Boolean, 
            default: false 
        },
        
        brand: { 
            type: String,
            trim: true
        },
        
        sku: { 
            type: String, 
            unique: true,  
            sparse: true   
        },
        
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        
        updatedAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    {
        collection: 'products'
    }
);

module.exports = mongoose.model('Product', productSchema);
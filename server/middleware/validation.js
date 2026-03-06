const createError = require('http-errors');

const validateProduct = (req, res, next) => {
    const { name, description, price, category, stock } = req.body;
    const errors = [];

    if (!name || name.trim() === '') 
    {
        errors.push('Product name is required');
    } 
    
    else if (name.length < 3) 
    {
        errors.push('Product name must be at least 3 characters');
    } 
    
    else if (name.length > 100) 
    {
        errors.push('Product name cannot exceed 100 characters');
    }

    if (!description || description.trim() === '') 
    {
        errors.push('Description is required');
    } 
    
    else if (description.length < 10) 
    {
        errors.push('Description must be at least 10 characters');
    }

    if (!price && price !== 0) 
    {
        errors.push('Price is required');
    } 
    
    else if (isNaN(price)) 
    {
        errors.push('Price must be a number');
    } 
    
    else if (price <= 0) 
    {
        errors.push('Price must be greater than 0');
    } 
    
    else if (price > 1000000) 
    {
        errors.push('Price cannot exceed 1,000,000');
    }

    const validCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

    if (!category) 
    {
        errors.push('Category is required');
    } 
    
    else if (!validCategories.includes(category)) 
    {
        errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    if (!stock && stock !== 0) 
    {
        errors.push('Stock quantity is required');
    } 
    
    else if (isNaN(stock)) 
    {
        errors.push('Stock must be a number');
    } 
    
    else if (stock < 0) 
    {
        errors.push('Stock cannot be negative');
    } 
    
    else if (!Number.isInteger(Number(stock))) 
    {
        errors.push('Stock must be a whole number');
    }

    if (errors.length > 0) 
    {
        return next(createError(400, errors.join('. ')));
    }

    next();
};

const validateCartItem = (req, res, next) => 
{
    const { productId, quantity } = req.body;
    const errors = [];

    if (!productId) 
    {
        errors.push('Product ID is required');
    }

    if (quantity !== undefined) 
    {
        if (isNaN(quantity)) 
        {
            errors.push('Quantity must be a number');
        } 
        
        else if (quantity < 1) 
        {
            errors.push('Quantity must be at least 1');
        } 
        
        else if (!Number.isInteger(Number(quantity))) 
        {
            errors.push('Quantity must be a whole number');
        }
    }

    if (errors.length > 0) 
    {
        return next(createError(400, errors.join('. ')));
    }

    next();
};

const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.params;
    const errors = [];

    if (!name || name.trim() === '') 
    {
        errors.push('Name is required');
    } 
    
    else if (name.length < 2) 
    {
        errors.push('Name must be at least 2 characters');
    } 
    
    else if (name.length > 50) 
    {
        errors.push('Name cannot exceed 50 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) 
    {
        errors.push('Email is required');
    } 
    
    else if (!emailRegex.test(email)) 
    {
        errors.push('Please provide a valid email address');
    }

    if (!password) 
    {
        errors.push('Password is required');
    } 
    
    else if (password.length < 6) 
    {
        errors.push('Password must be at least 6 characters');
    } 
    
    else if (password.length > 30) 
    {
        errors.push('Password cannot exceed 30 characters');
    } 
    
    else 
    {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasLetter || !hasNumber) 
        {
            errors.push('Password must contain at least one letter and one number');
        }
    }

    if (errors.length > 0) 
    {
        return next(createError(400, errors.join('. ')));
    }

    next();
};

const validateLogin = (req, res, next) => 
{
    const { email, password } = req.params;
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) 
    {
        errors.push('Email is required');
    } 
    
    else if (!emailRegex.test(email)) 
    {
        errors.push('Please provide a valid email address');
    }

    if (!password) 
    {
        errors.push('Password is required');
    } 
    
    else if (password.length < 6) 
    {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) 
    {
        return next(createError(400, errors.join('. ')));
    }

    next();
};

const validateId = (req, res, next) => 
{
    const id = req.params.id;
    
    if (!id) 
    {
        return next(createError(400, 'ID parameter is required'));
    }
    
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) 
    {
        return next(createError(400, 'Invalid ID format'));
    }
    
    next();
};

module.exports = 
{
    validateProduct,
    validateCartItem,
    validateRegistration,
    validateLogin,
    validateId
};
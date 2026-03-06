const router = require('express').Router();
const createError = require('http-errors');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validateCartItem, validateId } = require('../middleware/validation');

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

let JWT_PRIVATE_KEY;

try 
{
    JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8');
    console.log('Cart route: JWT key loaded successfully');
} 

catch (error) 
{
    console.error('Cart route: Error loading JWT key:', error.message);
    JWT_PRIVATE_KEY = 'development-fallback-secret-key';
}

const verifyToken = (req, res, next) => 
{
    const token = req.headers.authorization;
    
    if (!token) 
    {
        req.userId = null;
        return next();
    }
    
    try 
    {
        const decoded = jwt.verify(token, JWT_PRIVATE_KEY, { algorithm: 'RS256' });
        req.userId = decoded.userId;
        next();
    } 
    
    catch (err) 
    {
        console.error('Token verification error:', err);
        req.userId = null;
        next();
    }
};

router.use(verifyToken);

router.get('/cart', (req, res, next) => 
{
    if (!req.userId) 
    {
        return res.json({
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0
        });
    }
    
    Cart.findOne({ userId: req.userId, isActive: true })
        .populate('items.productId', 'name price photos')
        .then(cart => 
        {
            if (!cart) 
            {
                return res.json({
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    total: 0
                });
            }
            res.json(cart);
        })
        .catch(err => next(createError(500, 'Error fetching cart')));
});

router.post('/cart/add', validateCartItem, (req, res, next) => 
{
    const { productId, quantity = 1 } = req.body;
    
    if (!req.userId) 
    {
        return next(createError(401, 'Please log in to add items to cart'));
    }
    
    Product.findById(productId)
        .then(product => 
        {
            if (!product) 
            {
                return next(createError(404, 'Product not found'));
            }
            
            if (product.stock < quantity) 
            {
                return next(createError(400, 'Not enough stock available'));
            }
            
            return Cart.findOne({ userId: req.userId, isActive: true })
                .then(cart => 
                {
                    if (!cart) 
                    {
                        cart = new Cart({
                            userId: req.userId,
                            items: [],
                            subtotal: 0,
                            tax: 0,
                            total: 0
                        });
                    }
                    
                    const existingItemIndex = cart.items.findIndex(
                        item => item.productId.toString() === productId
                    );
                    
                    const imageFilename = product.photos && product.photos.length > 0 
                        ? product.photos[0].filename 
                        : '';
                    
                    if (existingItemIndex > -1) 
                    {
                        cart.items[existingItemIndex].quantity += quantity;
                    } 
                    
                    else 
                    {
                        cart.items.push({
                            productId: productId,
                            quantity: quantity,
                            price: product.price,
                            name: product.name,
                            imageFilename: imageFilename
                        });
                    }
                    
                    return cart.save();
                });
        })
        .then(updatedCart => 
        {
        res.json(updatedCart);
        })

        .catch(err => 
        {
            console.error('=== CART ADD ERROR DETAILS ===');
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);

            if (err.name === 'ValidationError') 
            {
                console.error('Validation errors:', err.errors);
            }

            if (err.code) 
            {
                console.error('MongoDB error code:', err.code);
            }
    
            next(createError(500, 'Error adding to cart: ' + err.message));
        });
});

router.put('/cart/update/:itemId', validateId, (req, res, next) => 
{
    const { quantity } = req.body;
    const { itemId } = req.params;
    
    if (!req.userId) 
    {
        return next(createError(401, 'Please log in to update cart'));
    }
    
    if (!quantity || quantity < 1) 
    {
        return next(createError(400, 'Valid quantity is required'));
    }
    
    Cart.findOne({ userId: req.userId, isActive: true })
        .then(cart => 
        {
            if (!cart) 
            {
                return next(createError(404, 'Cart not found'));
            }
            
            const itemIndex = cart.items.findIndex(
                item => item._id.toString() === itemId
            );
            
            if (itemIndex === -1) 
            {
                return next(createError(404, 'Item not found in cart'));
            }
            
            return Product.findById(cart.items[itemIndex].productId)
                .then(product => 
                {
                    if (!product) 
                    {
                        return next(createError(404, 'Product not found'));
                    }
                    
                    if (product.stock < quantity) 
                    {
                        return next(createError(400, 'Not enough stock available'));
                    }
                    
                    cart.items[itemIndex].quantity = quantity;
                    return cart.save();
                });
        })
        .then(updatedCart => 
        {
            res.json(updatedCart);
        })
        .catch(err => next(createError(500, 'Error updating cart')));
});

router.delete('/cart/remove/:itemId', validateId, (req, res, next) => 
{
    const { itemId } = req.params;
    
    if (!req.userId) 
    {
        return next(createError(401, 'Please log in to modify cart'));
    }
    
    Cart.findOne({ userId: req.userId, isActive: true })
        .then(cart => 
        {
            if (!cart) 
            {
                return next(createError(404, 'Cart not found'));
            }
            
            cart.items = cart.items.filter(
                item => item._id.toString() !== itemId
            );
            
            return cart.save();
        })
        .then(updatedCart => 
        {
            res.json(updatedCart);
        })
        .catch(err => next(createError(500, 'Error removing from cart')));
});

router.delete('/cart/clear', (req, res, next) => 
{
    if (!req.userId) 
    {
        return next(createError(401, 'Please log in to modify cart'));
    }
    
    Cart.findOneAndUpdate(
        { userId: req.userId, isActive: true },
        { items: [], subtotal: 0, total: 0 },
        { new: true }
    )
        .then(cart => 
        {
            if (!cart) 
            {
                return next(createError(404, 'Cart not found'));
            }
            res.json({ message: 'Cart cleared successfully', cart });
        })
        .catch(err => next(createError(500, 'Error clearing cart')));
});

module.exports = router;
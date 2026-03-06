const router = require('express').Router();
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const usersModel = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');

console.log('Loading JWT private key from:', process.env.JWT_PRIVATE_KEY_FILENAME);
console.log('Current directory:', __dirname);
console.log('Full path:', path.resolve(process.env.JWT_PRIVATE_KEY_FILENAME));

let JWT_PRIVATE_KEY;

try 
{

    JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8');
    console.log('PEM file loaded successfully. Key length:', JWT_PRIVATE_KEY.length);
    console.log('Key starts with:', JWT_PRIVATE_KEY.substring(0, 30) + '...');
} 

catch (error) 
{
    console.error('ERROR loading PEM file:', error.message);
    console.warn('Using fallback secret key for development');
    JWT_PRIVATE_KEY = 'development-fallback-secret-key-for-testing-only-2024';
}

router.post('/users/register/:name/:email/:password', validateRegistration, (req, res, next) => 
{
    usersModel.findOne({ email: req.params.email })
        .then(existingUser => 
        {
            if (existingUser) 
            {
                return next(createError(409, 'User with this email already exists'));
            }
            
            bcrypt.hash(req.params.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUNDS), (err, hash) =>
            {
                
                if (err) 
                {
                    return next(createError(500, 'Error encrypting password'));
                }
                
                usersModel.create({
                    name: req.params.name,
                    email: req.params.email,
                    password: hash,
                    accessLevel: parseInt(process.env.ACCESS_LEVEL_NORMAL_USER)
                })
                .then(newUser => 
                {
                    try 
                    {
                        const token = jwt.sign(
                            { 
                                email: newUser.email, 
                                accessLevel: newUser.accessLevel,
                                userId: newUser._id 
                            }, 
                            JWT_PRIVATE_KEY,
                            { algorithm: 'RS256', expiresIn: process.env.JWT_EXPIRY || '7d' }
                        );
                        
                        console.log('User registered successfully:', newUser.email);
                        
                        return res.json({
                            name: newUser.name,
                            email: newUser.email,
                            accessLevel: newUser.accessLevel,
                            token: token
                        });
                    } 
                    
                    catch (jwtError) 
                    {
                        console.error('JWT Error:', jwtError);
                        return next(createError(500, 'Error creating session token'));
                    }
                })
                
                .catch(err => 
                {
                    console.error('Create user error:', err);
                    next(createError(500, 'Error creating user'));
                });
            });
        })
        
        .catch(err => 
        {
            console.error('Find user error:', err);
            next(createError(500, 'Database error'));
        });
});

router.post('/users/login/:email/:password', validateLogin, (req, res, next) => 
{
    usersModel.findOne({ email: req.params.email })
        .then(user => 
        {
            if (!user) 
            {
                return next(createError(401, 'Invalid email or password'));
            }
            
            bcrypt.compare(req.params.password, user.password, (err, result) => {
                
                if (err) 
                {
                    return next(createError(500, 'Error comparing passwords'));
                }
                
                if (!result) 
                {
                    return next(createError(401, 'Invalid email or password'));
                }
                
                try 
                {
                    const token = jwt.sign(
                        { 
                            email: user.email, 
                            accessLevel: user.accessLevel,
                            userId: user._id 
                        }, 
                        JWT_PRIVATE_KEY, 
                        { algorithm: 'RS256', expiresIn: process.env.JWT_EXPIRY || '7d' }
                    );
                    
                    console.log('User logged in successfully:', user.email);
                    
                    res.json({
                        name: user.name,
                        email: user.email,
                        accessLevel: user.accessLevel,
                        token: token
                    });
                } 
                
                catch (jwtError) 
                {
                    console.error('JWT Error during login:', jwtError);
                    return next(createError(500, 'Error creating session token'));
                }
            });
        })
        
        .catch(err => 
        {
            console.error('Login error:', err);
            next(createError(500, 'Database error'));
        });
});

router.post('/users/logout', (req, res, next) => 
{
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
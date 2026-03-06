const jwt = require('jsonwebtoken');
const fs = require('fs');
const createError = require('http-errors');

const JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8');

const verifyToken = (req, res, next) => {

    const token = req.headers.authorization;
    
    if (!token) {
        return next(createError(401, 'No token provided'));
    }
    
    jwt.verify(token, JWT_PRIVATE_KEY, { algorithm: "HS256" }, (err, decodedToken) => {
        if (err) {
            return next(createError(403, 'Invalid or expired token'));
        }
        
        req.decodedToken = decodedToken;
        next();
    });
};

const isLoggedIn = (req, res, next) => {
    if (!req.decodedToken) {
        return next(createError(401, 'User is not logged in'));
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.decodedToken) {
        return next(createError(401, 'User is not logged in'));
    }
    
    if (req.decodedToken.accessLevel < parseInt(process.env.ACCESS_LEVEL_ADMIN)) {
        return next(createError(403, 'Administrator access required'));
    }
    next();
};

const isNormalUser = (req, res, next) => {
    if (!req.decodedToken) {
        return next(createError(401, 'User is not logged in'));
    }
    
    if (req.decodedToken.accessLevel < parseInt(process.env.ACCESS_LEVEL_NORMAL_USER)) {
        return next(createError(403, 'User access required'));
    }
    next();
};

module.exports = {
    verifyToken,
    isLoggedIn,
    isAdmin,
    isNormalUser
};
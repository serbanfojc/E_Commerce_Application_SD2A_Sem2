const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

dotenv.config({ path: path.join(__dirname, 'config', '.env') });

console.log('Environment variables loaded');
console.log('PORT from .env:', process.env.PORT);
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
console.log('Current directory:', __dirname);
console.log('Looking for .env at:', path.join(__dirname, 'config', '.env'));

const app = express();

if (!process.env.MONGODB_URI) 
{
    console.error('ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => 
    {
        console.log('Connected to MongoDB');
    })
    .catch((error) => 
    {
        console.error('Error connecting to MongoDB', error.message);
        process.exit(1);
    });

app.use(cors());
app.use(express.json());

app.use(require('./routes/users'));
app.use(require('./routes/products'));
app.use(require('./routes/cart'));

app.use(notFoundHandler);

app.use(errorHandler);

app.get('/', (req, res) => 
{
    res.json({ message: 'E-Commerce API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
{
    console.log(`Server is running on the port ${PORT}`);
});
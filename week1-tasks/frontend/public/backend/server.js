const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quote-of-the-day', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected');
    initializeQuotes();
})
.catch(err => console.log('MongoDB Connection Error:', err));

// Quote Schema
const quoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);

// Initialize quotes
async function initializeQuotes() {
    try {
        const count = await Quote.countDocuments();
        if (count === 0) {
            const defaultQuotes = [
                {
                    text: "The only way to do great work is to love what you do.",
                    author: "Steve Jobs"
                },
                {
                    text: "Innovation distinguishes between a leader and a follower.",
                    author: "Steve Jobs"
                },
                {
                    text: "Stay hungry, stay foolish.",
                    author: "Steve Jobs"
                },
                {
                    text: "Your time is limited, so don't waste it living someone else's life.",
                    author: "Steve Jobs"
                },
                {
                    text: "The future belongs to those who believe in the beauty of their dreams.",
                    author: "Eleanor Roosevelt"
                }
            ];
            await Quote.insertMany(defaultQuotes);
            console.log('Default quotes added to database');
        }
    } catch (error) {
        console.error('Error initializing quotes:', error);
    }
}

// Routes
app.get('/api/quote', async (req, res) => {
    try {
        const count = await Quote.countDocuments();
        if (count === 0) {
            return res.status(404).json({ message: 'No quotes available' });
        }
        const random = Math.floor(Math.random() * count);
        const quote = await Quote.findOne().skip(random);
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/quotes/search', async (req, res) => {
    try {
        const { author } = req.query;
        if (!author) {
            return res.status(400).json({ message: 'Author name is required' });
        }
        
        const quotes = await Quote.find({
            author: { $regex: author, $options: 'i' } // Case-insensitive search
        });
        
        if (quotes.length === 0) {
            return res.status(404).json({ message: 'No quotes found for this author' });
        }
        
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/quote', async (req, res) => {
    try {
        const quote = new Quote({
            text: req.body.text,
            author: req.body.author
        });
        const newQuote = await quote.save();
        res.status(201).json(newQuote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
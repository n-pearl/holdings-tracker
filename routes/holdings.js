const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { getStockPerformance, getCryptoPerformance } = require('../routes/performance');

router.post('/add', async (req, res) => {
    const { username, holdingName, holdingType, holdingSymbol } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username, holdings: [] });
        }

        const holding = user.holdings.find(
            h => h.name.toLowerCase() === holdingName.toLowerCase()
        );

        if (!holding) {
            user.holdings.push({ name: holdingName, type: holdingType, symbol: holdingType === 'stock' ? holdingSymbol : holdingName.toLowerCase() });
        } else {
            return res.status(400).json({ message: 'Holding already exists' });
        }

        await user.save();
        res.status(200).json({ message: 'Holding added successfully' });
    } catch (error) {
        console.error('Error adding holding:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/analyze', async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({ username });

        if (!user || user.holdings.length === 0) {
            return res.status(200).json([]);
        }

        const results = await Promise.all(user.holdings.map(async holding => {
            let performanceData;
            try {
                if (holding.type === 'stock') {
                    performanceData = await getStockPerformance(holding.symbol);
                } else if (holding.type === 'crypto') {
                    performanceData = await getCryptoPerformance(holding.name.toLowerCase());
                }

                const avgSentiment = 0;  // Placeholder for sentiment analysis logic
                const articles = [];  // Placeholder for news articles

                return { holding, avgSentiment, articles, performanceData };
            } catch (error) {
                return { holding, avgSentiment: 0, articles: [], performanceData: null };
            }
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error('Error analyzing holdings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

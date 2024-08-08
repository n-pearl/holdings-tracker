const axios = require('axios');
const express = require('express');
const router = express.Router();

const alphavantageKey = process.env.ALPHA_API_KEY;
const coingeckoBaseURL = 'https://api.coingecko.com/api/v3';

async function getStockPerformance(symbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&apikey=${alphavantageKey}`;
    const response = await axios.get(url);
    return response.data;
}

async function getCryptoPerformance(name) {
    const url = `${coingeckoBaseURL}/coins/markets?vs_currency=usd&ids=${name}`;
    const response = await axios.get(url);
    return response.data;
}

router.get('/performance', async (req, res) => {
    const { type, symbol, name } = req.query;
    try {
        let data;
        if (type === 'stock') {
            data = await getStockPerformance(symbol);
        } else if (type === 'crypto') {
            data = await getCryptoPerformance(name);
        } else {
            return res.status(400).json({ message: 'Invalid holding type' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({ message: 'Error fetching performance data' });
    }
});

module.exports = router;

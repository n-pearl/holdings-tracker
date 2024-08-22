// performance.js

const axios = require('axios');
const express = require('express');
const router = express.Router();

const alphavantageKey = process.env.ALPHAVANTAGE_API_KEY;
const coingeckoBaseURL = 'https://api.coingecko.com/api/v3';

router.get('/api/performance', async (req, res) => {
    const { type, symbol, name } = req.query;

    async function getStockPerformance(symbol) {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=30min&apikey=${alphavantageKey}`;
        const response = await axios.get(url);
        if (!response.data['Time Series (30min)']) {
            throw new Error('No time series data found');
        }
        return Object.keys(response.data['Time Series (30min)']).map(time => ({
            time,
            value: parseFloat(response.data['Time Series (30min)'][time]['4. close'])
        }));
    }

    async function getCryptoPerformance(name) {
        const url = `${coingeckoBaseURL}/coins/markets?vs_currency=usd&ids=${name}`;
        const response = await axios.get(url);
        if (response.data.length === 0) {
            throw new Error('No market data found');
        }
        return response.data.map(item => ({
            time: item.last_updated,
            value: item.current_price
        }));
    }

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

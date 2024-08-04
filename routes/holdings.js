const express = require('express');
const axios = require('axios');
const Sentiment = require('sentiment');
const router = express.Router();
const Holding = require('../models/Holding');

const sentiment = new Sentiment();

router.post('/', async (req, res) => {
    const { name, type, user } = req.body;

    const newHolding = new Holding({ name, type, user });
    await newHolding.save();

    res.json(newHolding);
});

router.get('/analyze', async (req, res) => {
    const holdings = await Holding.find();
    const results = [];

    for (const holding of holdings) {
        const news = await axios.get(`https://newsapi.org/v2/everything?q=${holding.name}&apiKey=${process.env.NEWS_API_KEY}`);
        const articles = news.data.articles;

        let sentimentScore = 0;
        articles.forEach(article => {
            const result = sentiment.analyze(article.title + ' ' + article.description);
            sentimentScore += result.score;
        });

        const avgSentiment = sentimentScore / articles.length;
        results.push({ holding, avgSentiment });
    }

    res.json(results);
});

module.exports = router;

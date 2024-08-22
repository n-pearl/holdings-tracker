const express = require('express');
const router = express.Router();
const axios = require('axios');
const sentiment = new (require('sentiment'))();

async function fetchNews(holdingName) {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsapi.org/v2/everything?q=${holdingName}&from=${new Date().toISOString()}&sortBy=publishedAt&apiKey=${apiKey}`;
    const response = await axios.get(url);
    return response.data.articles;
}

async function fetchNewsAndAnalyze(holding) {
    const articles = await fetchNews(holding.name);
    const analyzedArticles = articles.map(article => {
        const sentimentResult = sentiment.analyze(article.description || article.content || '');
        return {
            title: article.title,
            content: article.content,
            sentiment: sentimentResult.score
        };
    });

    const avgSentiment = analyzedArticles.reduce((acc, val) => acc + val.sentiment, 0) / analyzedArticles.length || 0;

    return { articles: analyzedArticles, avgSentiment };
}

// Define your route here
router.get('/analyze', async (req, res) => {
    const { holdingName } = req.query;
    try {
        const holding = { name: holdingName }; // Example of extracting holding from query params
        const analysisResults = await fetchNewsAndAnalyze(holding);
        res.json(analysisResults);
    } catch (error) {
        console.error('Error fetching news and sentiment:', error);
        res.status(500).json({ message: 'Error analyzing news' });
    }
});

module.exports = router;

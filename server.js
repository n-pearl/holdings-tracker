const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User model
const userSchema = new mongoose.Schema({
  username: String,
  holdings: Array,
});

const User = mongoose.model('User', userSchema);

// Utility function to fetch news articles
async function fetchNewsArticles(holding) {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${holding.name}&apiKey=${process.env.NEWS_API_KEY}&language=en`);
    return response.data.articles.map(article => ({
      title: article.title,
      sentiment: 'neutral' // Placeholder for sentiment analysis logic
    }));
  } catch (error) {
    console.error(`Error fetching news for ${holding.name}:`, error);
    return [];
  }
}

// Utility function to fetch performance data
async function fetchPerformanceData(holding) {
  try {
    let response;

    if (holding.type === 'stock') {
      // Use Alpha Vantage API for stocks
      response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: holding.symbol,
          apikey: process.env.ALPHA_API_KEY
        }
      });

      if (response.data['Time Series (Daily)']) {
        const timeSeries = response.data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).slice(0, 30).reverse(); // Last 30 days
        const performanceData = dates.map(date => ({
          date,
          value: parseFloat(timeSeries[date]['4. close']) // Closing price
        }));

        return performanceData;
      } else {
        console.error('No data found for the specified stock symbol.');
        return [];
      }

    } else if (holding.type === 'crypto') {
      // Use CoinGecko API for cryptocurrencies
      response = await axios.get(`https://api.coingecko.com/api/v3/coins/${holding.symbol}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: '30',
        }
      });

      if (response.data.prices) {
        const performanceData = response.data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toISOString().split('T')[0],
          value: price
        }));

        return performanceData;
      } else {
        console.error('No data found for the specified cryptocurrency.');
        return [];
      }

    } else {
      throw new Error('Unsupported holding type');
    }

  } catch (error) {
    console.error(`Error fetching performance data for ${holding.name}:`, error);
    return [];
  }
}

// API endpoint to analyze user holdings
app.get('/api/analyze', async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const results = await Promise.all(user.holdings.map(async holding => {
      const articles = await fetchNewsArticles(holding);
      const performanceData = await fetchPerformanceData(holding);

      return {
        holding: holding,
        articles: articles,
        performanceData: performanceData,
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Error analyzing holdings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/results.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/results.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

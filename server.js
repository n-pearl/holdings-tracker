const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  holdings: Array,
});

const User = mongoose.model('User', userSchema);

async function fetchNewsArticles(holding) {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${holding.name}&apiKey=${process.env.NEWS_API_KEY}&language=en`);
    return response.data.articles.map(article => ({
      title: article.title,
      sentiment: 'neutral'
    }));
  } catch (error) {
    console.error(`Error fetching news for ${holding.name}:`, error);
    return [];
  }
}

async function fetchPerformanceData(holding) {
  try {
    let response;

    if (holding.type === 'stock') {
      response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: holding.symbol,
          apikey: process.env.ALPHA_API_KEY
        }
      });

      if (response.data['Time Series (Daily)']) {
        const timeSeries = response.data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const performanceData = dates.map(date => ({
          date,
          value: parseFloat(timeSeries[date]['4. close'])
        }));

        return performanceData;
      } else {
        console.error('No data found for the specified stock symbol. Please check the symbol and try again.');
        return [];
      }

    } else if (holding.type === 'crypto') {
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
        console.error('No data found for the specified cryptocurrency. Please try again later.');
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

app.post('/api/addHolding', async (req, res) => {
  try {
      const { username, holdingName, holdingType, stockSymbol } = req.body;

      if (!username || !holdingName || !holdingType) {
          return res.status(400).json({ error: 'Invalid input' });
      }

      let user = await User.findOne({ username });

      if (!user) {
          user = new User({ username, holdings: [] });
      }

      user.holdings.push({ name: holdingName, type: holdingType, symbol: stockSymbol });
      await user.save();

      res.json({ message: 'Holding added successfully', holding: { name: holdingName, type: holdingType, symbol: stockSymbol } });
  } catch (error) {
      console.error('Error adding holding:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/results.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/results.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

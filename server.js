// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your NewsAPI key or set it as an environment variable.
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_NEWS_API_KEY';

// A simple AI model: score articles based on F1-related keywords.
function scoreArticle(article) {
  let score = 0;
  const keywords = ['F1', 'Formula 1', 'racing', 'Grand Prix', 'Mercedes', 'Ferrari', 'Red Bull'];
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();
  keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 1;
    }
  });
  return score;
}

// Endpoint to fetch and rank news articles
app.get('/api/news', async (req, res) => {
  try {
    // Fetch news articles using NewsAPI (example: search for "F1")
    const response = await axios.get(`https://newsapi.org/v2/everything?q=F1&apiKey=$138a0d55b5e1472f9580399721eff120`);
    let articles = response.data.articles;
    
    // Score each article and sort by highest score
    articles.forEach(article => {
      article.aiScore = scoreArticle(article);
    });
    articles.sort((a, b) => b.aiScore - a.aiScore);
    
    // Return the top 10 articles
    res.json(articles.slice(0, 10));
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({ error: 'Error fetching news' });
  }
});

// Serve frontend static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

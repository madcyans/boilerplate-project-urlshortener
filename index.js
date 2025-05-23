require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Middleware to parse urlencoded POST data
app.use(express.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory "database" to store URLs.
// The "short_url" will be the 1-based index of the URL in the array.
let urlDatabase = [];

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const original_url = req.body.url;
  let urlObject;

  // Validate the URL format using the URL constructor.
  try {
    urlObject = new URL(original_url);
    // Check that the protocol is either http or https.
    if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
0
  // Use dns.lookup to verify that the hostname exists.
  dns.lookup(urlObject.hostname, (err, address) => {
    if (err) {
      // If DNS lookup fails, return an error JSON.
      return res.json({ error: 'invalid url' });
    }

    // The URL is valid; add it to our "database".
    const short_url = urlDatabase.length + 1;
    urlDatabase.push(original_url);

    // Return a JSON response with the original URL and its new short URL.
    return res.json({ original_url, short_url });
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  const short_url = parseInt(req.params.short_url);

  // Check if a valid short_url exists in our "database".
  if (!short_url || short_url > urlDatabase.length) {
    return res.json({ error: 'invalid url' });
  }

  // Retrieve the original URL (adjusting for zero-based index).
  const original_url = urlDatabase[short_url - 1];
  res.redirect(original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

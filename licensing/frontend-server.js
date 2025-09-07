const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.FRONTEND_PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// Serve static files
app.use(express.static(FRONTEND_DIR));

// Inject API URL into index.html
app.get('/', (req, res) => {
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Inject API URL as a global variable
  const scriptTag = `<script>window.API_URL = '${API_URL}';</script>`;
  html = html.replace('<head>', `<head>${scriptTag}`);
  
  res.send(html);
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Inject API URL as a global variable
  const scriptTag = `<script>window.API_URL = '${API_URL}';</script>`;
  html = html.replace('<head>', `<head>${scriptTag}`);
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log(`API URL: ${API_URL}`);
});

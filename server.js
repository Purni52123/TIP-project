const express = require('express');
const path    = require('path');

const placesRouter = require('./routes/places');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve everything in /public as static files
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/places', placesRouter);

// POST /api/subscribe — newsletter subscription (in-memory store)
const subscribers = [];

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (subscribers.includes(email.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'You are already subscribed!' });
  }

  subscribers.push(email.toLowerCase());
  console.log(`📧 New subscriber: ${email}  (total: ${subscribers.length})`);

  res.json({ success: true, message: 'Thanks for subscribing! 🎉' });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), subscribers: subscribers.length });
});

// ── Catch-all — serve index.html for any unmatched GET (SPA-friendly) ─────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✈️  Planora server running at http://localhost:${PORT}`);
  console.log(`   API → http://localhost:${PORT}/api/places`);
  console.log(`   Press Ctrl+C to stop.\n`);
});

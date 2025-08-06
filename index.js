const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/events', (req, res) => {
  const results = [];

  const today = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);

  fs.createReadStream('events.csv')
    .pipe(csv())
    .on('data', (row) => {
      const eventStart = new Date(row.startDate);
      if (eventStart >= today && eventStart <= sixMonthsFromNow) {
        results.push(row);
      }
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error('CSV read error:', err);
      res.status(500).json({ error: 'Failed to read events.csv' });
    });
});

app.get('/', (req, res) => {
  res.send('CSV Events API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

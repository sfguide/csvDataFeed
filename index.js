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
      try {
        const eventDate = new Date(row.startDate);
        if (eventDate >= today && eventDate <= sixMonthsFromNow) {
          results.push(row);
        }
      } catch (err) {
        console.error('Error parsing row:', err);
      }
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Error reading events.csv' });
    });
});

app.get('/', (req, res) => {
  res.send('Events API is running (CSV version).');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

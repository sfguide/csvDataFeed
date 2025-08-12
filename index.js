const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/events', (req, res) => {
  const results = [];

  const userStartDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
  const classification = req.query.classificationName?.toLowerCase();

  fs.createReadStream('events_2.csv')
    .pipe(csv())
    .on('data', (row) => {
      const eventStart = new Date(row.startDate);
      
      const startDateMatch = eventStart >= userStartDate;

      // Optional classificationName filtering
      const classificationMatch = classification
        ? row.classificationName?.toLowerCase().includes(classification)
        : true;

      if (startDateMatch && classificationMatch) {
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

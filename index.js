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

  fs.createReadStream('Events_1.csv')
    .pipe(csv())
    .on('data', (row) => {
      const eventStart = new Date(row.startDate);
      const eventEnd = new Date(row.endDate);          //new to check date range
      
      //const startDateMatch = eventStart >= userStartDate;   comment 8/13 for check date ranage
      const dateInRange = eventEnd >= userStartDate;      //from chat on 

      // Optional classificationName filtering
      const classificationMatch = classification
        ? row.classificationName?.toLowerCase().includes(classification)
        : true;

      //debug loggin
      //console.log('Row:', row);
      //console.log('userStartDate:', userStartDate);
      console.log('eventStart:', eventStart, 'eventEnd:', eventEnd);
      console.log('dateInRange:', dateInRange, 'classificationMatch:', classificationMatch);
      
      //      if (startDateMatch && classificationMatch) {        8/13 test
      if (dateInRange && classificationMatch) {
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

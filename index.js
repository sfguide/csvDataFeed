const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/events', (req, res) => {
  const results = [];
  const { startDate, classificationName } = req.query;

  fs.createReadStream('events.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      try {
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);

        const filtered = results.filter(event => {
          const eventStart = new Date(event.startDate);
          const matchesStart = eventStart >= today && eventStart <= sixMonthsFromNow;
          const matchesFilter = (!startDate || event.startDate === startDate) &&
                                (!classificationName || event.classificationName === classificationName);
          return matchesStart && matchesFilter;
        });

        res.json(filtered);
      } catch (err) {
        console.error('Error processing CSV:', err);
        res.status(500).json({ error: 'Error processing CSV' });
      }
    });
});

app.get('/', (req, res) => {
  res.send('Events API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

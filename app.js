const express = require('express')
const app = express()
const fs = require('fs');
const csvParser = require('csv-parser');

app.get('/', (req, res) => {
  const results = [];

  fs.createReadStream('data/Egreesos_Prefeitura.csv')
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => {
          res.json(results);
      });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

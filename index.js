const express = require('express');

const app = express();
const HTTP_PORT = 3000;

app.use(express.static('public'));

app.get('/api/random', (req, res) => {
  res.send({
    success: true,
    message: (Math.random() * 10) + 1,
  });
});

app.listen(HTTP_PORT);
console.log(`Listening on port: ${HTTP_PORT} -- Open http://localhost:${HTTP_PORT}`);

const express = require('express');

const challongeAPI = require('./src/challonge');

const app = express();
const HTTP_PORT = 3000;

app.use(express.static('public'));

app.get('/tournaments', (req, res) =>
  challongeAPI.tournaments.getAll()
    .then(apiRes => res.json(apiRes)));

app.get('/pingPong/participants', (req, res) =>
  challongeAPI.tournaments.getTournamentsByType('Table Tennis')
    .then((tournaments) => {
      const participants = {};
      tournaments.forEach(({ tournament }) => {
        challongeAPI.participants.getAll(tournament.id)
          .then((allParticipants) => {
            allParticipants.forEach(({ participant }) => {
              challongeAPI.participants.show(tournament.id, participant.id, { include_matches: 1 })
                .then(({ participant: partData }) => {
                  const { name } = partData;
                  if (typeof participants[name] === 'undefined') {
                    participants[name] = partData;
                  } else {
                    participants[name].matches.concat(partData.matches);
                  }
                });
            });
          });
      });
      // HAXXXXX Convert this to proper async patterns
      setTimeout(() => res.json(participants), 2000);
    }));

app.get('/api/random', (req, res) => {
  res.send({
    success: true,
    message: (Math.random() * 10) + 1,
  });
});

app.listen(HTTP_PORT);
console.log(`Listening on port: ${HTTP_PORT} -- Open http://localhost:${HTTP_PORT}`);

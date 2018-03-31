const Promise = require('bluebird');
const express = require('express');

const { tournaments, participants } = require('./src/challonge');

const app = express();
const HTTP_PORT = 3000;


// HELPERS MOVE THESE TO the right place please
/**
 * Get an array of all players from a list of tournaments
 *   -- This will have dupes in it unless the player has an account
 *
 * @param {Array} tournies -- Array containing tournament objects
 *
 * @returns Promise of all players the passed in from the tournament
 */
function getAllPlayersFromTournaments(tournies) {
  const participantPromises = [];
  tournies.forEach(({ tournament }) => {
    participantPromises.push(participants.getAll(tournament.id));
  });
  return Promise.all(participantPromises);
}

/**
 * Get player data from a tournament (with match data)
 *
 * @param {Object} allParticipants -- Array of participant data
 *
 * @returns Promise of all player data from tournament
 */
function getPlayerDataFromTournament(allParticipantAllTournies) {
  let allParticipants = [];

  allParticipantAllTournies.forEach((allTournamentParticipants) => {
    allParticipants = allParticipants.concat(allTournamentParticipants);
  });
  return Promise.map(
    allParticipants,
    ({ participant }) =>
      participants.show(participant.tournament_id, participant.id, { include_matches: 1 }),
    { concurrency: 15 }, // 15 seems to be the ceiling here, more than this it times out
  );
}

function processPlayerData(participantData) {
  const players = {};
  participantData.forEach(({ participant }) => {
    const { name } = participant;
    if (typeof players[name] === 'undefined') {
      players[name] = participant;
      // Since players dont have consistant ids, we need to track all ids this player is known by
      players[name].knownPlayerIds = [participant.id];
    } else {
      players[name].matches = players[name].matches.concat(participant.matches);
      players[name].knownPlayerIds.push(participant.id);
    }
  });

  // TODO: Something is slightly awry here
  // Record Aggregator
  Object.keys(players).forEach((playerName) => {
    const player = players[playerName];
    const record = {
      wins: 0,
      losses: 0,
    };
    player.matches.forEach(({ match }) => {
      if (player.knownPlayerIds.includes(match.winner_id)) {
        record.wins += 1;
      } else if (player.knownPlayerIds.includes(match.loser_id)) {
        record.losses += 1;
      }
    });
    // Set the players record
    player.record = record;
  });

  // Sort by best record
  const sortedPlayers = Object.keys(players).sort((nameA, nameB) => {
    const playerA = players[nameA];
    const playerB = players[nameB];
    if (playerA.record.wins === playerB.record.wins) {
      return playerA.record.losses - playerB.record.losses;
    }
    return playerB.record.wins - playerA.record.wins;
  })
    .map(playerName => players[playerName]);

  return sortedPlayers;
}

tournaments.getTournamentsByType('Table Tennis')
  .then(tournies =>
    getAllPlayersFromTournaments(tournies)
      .then(getPlayerDataFromTournament)
      .then(processPlayerData)
      .then((players) => {
        Object.keys(players).forEach((name, index) => {
          const player = players[name];
          console.log(`${index + 1}: ${player.name} -- Record: ${player.record.wins} - ${player.record.losses}`);
        });
      }))
  .catch((e) => {
    console.info('HNY -- ERROR = ', e);
  });

app.use(express.static('public'));

app.get('/tournaments', (req, res) =>
  tournaments.getAll()
    .then(apiRes => res.json(apiRes)));

app.get('/tableTennis/players', (req, res) =>
  tournaments.getTournamentsByType('Table Tennis')
    .then(tournies =>
      getAllPlayersFromTournaments(tournies)
        .then(getPlayerDataFromTournament)
        .then(processPlayerData)
        .then(players => res.json(players))));

app.get('/api/random', (req, res) => {
  res.send({
    success: true,
    message: (Math.random() * 10) + 1,
  });
});

app.listen(HTTP_PORT);
console.log(`Listening on port: ${HTTP_PORT} -- Open http://localhost:${HTTP_PORT}`);

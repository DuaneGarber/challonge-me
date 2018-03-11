const challongeRequest = require('./base');

module.exports = {
  index: (tournamentId, params = {}) => challongeRequest('GET', 'tournaments.json', params),
  show: (tournamentId, params = {}) => challongeRequest('GET', `tournaments/${tournamentId}.json`, params),
};

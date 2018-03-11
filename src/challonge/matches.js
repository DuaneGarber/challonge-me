const challongeRequest = require('./base');

module.exports = {
  index: (tournamentId, params = {}) => challongeRequest('GET', `tournaments/${tournamentId}/matches.json`, params),
  show: (tournamentId, matchId, params = {}) => challongeRequest('GET', `tournaments/${tournamentId}/matches/${matchId}.json`, params),
  update: (tournamentId, matchId, params = {}) => challongeRequest('PUT', `tournaments/${tournamentId}/matches/${matchId}.json`, params),
};

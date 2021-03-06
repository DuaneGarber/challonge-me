const challongeRequest = require('./base');

module.exports = {
  getAll: (tournamentId, params = {}) => challongeRequest('GET', `tournaments/${tournamentId}/participants.json`, params),
  show: (tournamentId, participantId, params = {}) => challongeRequest('GET', `tournaments/${tournamentId}/participants/${participantId}.json`, params),
};

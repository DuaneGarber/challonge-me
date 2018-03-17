const challongeRequest = require('./base');

const getAllTournaments = (params = {}) => challongeRequest('GET', 'tournaments.json', params);

module.exports = {
  getAll: getAllTournaments,
  show: (tournamentId, params = {}) => challongeRequest('GET', `tournaments/${tournamentId}.json`, params),
  getTournamentsByType: (type, params = {}) =>
    getAllTournaments(params)
      .then((tournaments) => {
        const filteredTournaments = tournaments
          .filter(({ tournament }) => tournament.game_name === type);
        return filteredTournaments;
      }),
};

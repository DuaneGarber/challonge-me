const request = require('superagent');

const { USER_NAME, API_KEY } = process.env;

if (!USER_NAME || !API_KEY) {
  console.error('User Name and Api Key are expected environment vars (USER_NAME="DuaneHoney" API_KEY="abc" npm start)');
  process.exit(1);
}

const BASE_URL = `https://${USER_NAME}:${API_KEY}@api.challonge.com/v1/`;

module.exports = (method, uri, params) => {
  const options = {};
  switch (method) {
    case 'GET':
    case 'DELETE':
    case 'PUT':
      options.qs = params;
      return request(method, `${BASE_URL}/${uri}`).query(params);
    case 'POST':
      options.body = params;
      return request.post(`${BASE_URL}/${uri}`).send(params);
    default:
      console.error('ERROR -- No Method Passed to Challonge API');
      break;
  }
  return Promise.reject(new Error('Invalid Method passed to Challonge API'));
};


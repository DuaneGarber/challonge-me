const request = require('superagent');

const { USER_NAME, API_KEY } = process.env;

if (!USER_NAME || !API_KEY) {
  console.error('User Name and Api Key are expected environment vars (USER_NAME="DuaneHoney" API_KEY="abc" npm start)');
  process.exit(1);
}

const BASE_URL = `https://${USER_NAME}:${API_KEY}@api.challonge.com/v1`;

module.exports = (method, uri, params) => {
  const options = {};
  let reqPromise = Promise.resolve({});
  switch (method) {
    case 'GET':
    case 'DELETE':
    case 'PUT':
      options.qs = params;
      reqPromise = request(method, `${BASE_URL}/${uri}`)
        .query(params)
        .set('Accept', 'application/json');
      break;
    case 'POST':
      options.body = params;
      reqPromise = request.post(`${BASE_URL}/${uri}`)
        .send(params)
        .set('Accept', 'application/json');
      break;
    default:
      console.error('ERROR -- No Method Passed to Challonge API');
      return Promise.reject(new Error('Invalid Method passed to Challonge API'));
  }
  return reqPromise
    .then((res) => {
      let jsonRes = {};
      try {
        // TODO: Remember how to make super agent return JSON
        jsonRes = JSON.parse(res.text);
      } catch (e) {
        console.error('Superagent Returned response in a bad format');
        Promise.reject(new Error('Superagent Returned response in a bad format', e));
      }
      return jsonRes;
    });
};


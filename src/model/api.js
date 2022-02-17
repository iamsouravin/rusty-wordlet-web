import { API } from 'aws-amplify';

const apiName = 'rustyWordletAPI';
const rustyWordletApi = {
    getCurrentGame: async function (userId) {
        const path = '/users/' + userId + '/games/current';
        const myInit = { // OPTIONAL
            headers: {}, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
            queryStringParameters: {  // OPTIONAL

            },
        };

        return API
            .get(apiName, path, myInit)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.log('error.response', error.response);
            });
    },
    checkGuess: function (userId, guess) {
        const path = '/users/' + userId + '/games/current/guesses';
        const myInit = { // OPTIONAL
            headers: {}, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
            queryStringParameters: {  // OPTIONAL

            },
            body: {
                guess: guess,
            }, // replace this with attributes you need
        };

        return API
            .post(apiName, path, myInit)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.log('error.response', error.response);
            });
    },
    newGame: function (userId, guess) {
        const path = '/users/' + userId + '/games';
        const myInit = { // OPTIONAL
            headers: {}, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
            queryStringParameters: {  // OPTIONAL

            },
            body: {
            }, // replace this with attributes you need
        };

        return API
            .post(apiName, path, myInit)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.log('error.response', error.response);
            });
    }
};

export default rustyWordletApi;
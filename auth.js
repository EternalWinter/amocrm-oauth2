const axios = require('axios');
const fs = require('fs');
const options = require('./options.js');
const refresh = require('./options.js');
const { tokens } = require('./tokens.js');

class Authorization {
    constructor({options}, {refresh}) {
        this.options = options;
        this.refresh = refresh;
    }

    // there we have the access and refresh token from amoCRM
    getTokens() {
        axios.post(
            'https://tema24.amocrm.ru/oauth2/access_token',
            this.options)
            .then((result) => {
                console.log('result', result)
                fs.writeFile('tokens.js',
                    'exports.tokens = ' + JSON.stringify(result.data),
                    'utf8',
                    function (error) {
                        if (error) throw error;
                        console.log('error:', error);
                    }
                )
            })
            .catch(err => {
                console.log('err:', err)
            });
    }
    // there we are refresh the amoCRM access token
    refreshTokens() {
        axios.post('https://tema24.amocrm.ru/oauth2/access_token',
            this.refresh)
            .then((result) => {
                console.log('result', result)
                fs.writeFile('tokens.js',
                    'exports.tokens = ' + JSON.stringify(result.data),
                    'utf8',
                    function (error) {
                        if (error) throw error;
                        console.log('error:', error);
                    })
            })
            .catch(err => {
                console.log('err:', err)
            })
    }
}

const token = new Authorization(options, refresh);
try {
    if (!tokens.refresh_token) {
        token.getTokens();
    } else {
        setInterval(() => {
            token.refreshTokens();
            console.log('Succesfull');
        }, 70000);
    }
}
catch (e) {
    console.log(e);
}
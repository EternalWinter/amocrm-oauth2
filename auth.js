const axios = require('axios');
const fs = require('fs');
const options = require('./options.js');
const refresh = require('./options.js');
const { tokens } = require('./tokens.js');
const CronJob = require('cron').CronJob;



class Authorization {
    constructor({options}, {refresh}, subdomain) {
        this.options = options;
        this.refresh = refresh || null;
        this.subdomain = subdomain
    }

    // there we have the access and refresh token from amoCRM
    getTokens() {
        axios.post(
            `https://${this.subdomain}.amocrm.ru/oauth2/access_token`,
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
        axios.post(`https://${this.subdomain}.amocrm.ru/oauth2/access_token`,
            this.refresh)
            .then((result) => {
                console.log('result', result.data)
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
// added the "subdomain" arg
const token = new Authorization(options, refresh, 'tema24');
// update the schedule method: everyday at 13:00 script will refresh the tokens
try {
    const job = new CronJob('00 00 13 * * 0-6', function () {
        if (!tokens.refresh_token) {
            token.getTokens();
        } else {
            token.refreshTokens();
            console.log('Succesfull refresh');
        }
    },
        null,
        true,
        "Asia/Krasnoyarsk");
}
catch (e) {
    console.log('ERROR:', e);
}

module.exports = Authorization;

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
    async getTokens() {
        try {
            const response = await axios.post(
                `https://${this.subdomain}.amocrm.ru/oauth2/access_token`,
                this.options);
            fs.writeFile('tokens.js',
                'exports.tokens = ' + JSON.stringify(response.data),
                'utf8',
                function (error) {
                    if (error) throw error;
                    console.log('error:', error);
                })
        } catch (e) {
            if (e) console.log('err:', e);
        }
    }

    // there we are refresh the amoCRM access token
    async refreshTokens() {
        try {
            const response = await axios.post(`https://${this.subdomain}.amocrm.ru/oauth2/access_token`,
                this.refresh);
            console.log(response.data);
            fs.writeFile('tokens.js',
                'exports.tokens = ' + JSON.stringify(response.data),
                'utf8',
                function (error) {
                    if (error) throw error;
                    console.log('error:', error);
                });
        } catch (e) {
            if (e) console.log('err:', e);
        }
    }
}
// added the "subdomain" arg
const token = new Authorization(options, refresh, '***');
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

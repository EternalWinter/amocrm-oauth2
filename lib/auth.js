const axios = require('axios');
const fs = require('fs');
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
            if (e) this.refreshTokens();
            console.log('error from getTokens() : ', e);
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

module.exports = Authorization;


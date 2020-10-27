const axios = require('axios');
const Contact = require('./contact');

class Lead extends Contact {
    constructor(...args) {
        super(...args)
    }

    async getLeadsInfoById(result) {
        try {
            const response = await axios.get(`https://${this.subdomain}.amocrm.ru/api/v2/leads?id=${result}`, this.config);
            return response.data;
        } catch (e) {
            if (e) throw 'error from gedLeadsInfoById: ' + e.data;
        }
    }

    makeRequestToLeadCreating() {

    }

    async createLeadByContactId(result) {
        try {
            const response = await axios.post(`https://${this.subdomain}.amocrm.ru/api/v2/leads?id=${result}`, this.config);
        } catch (e) {
            if (e) throw 'error from createLeadByContactId', e.data;
        }
    }
}

module.exports = Lead;
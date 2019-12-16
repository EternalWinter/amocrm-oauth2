const folder = require('../src/deploy.js');
const tokens = require(`../../../${folder}/tokens.js`);
const axios = require('axios');

class Contact {
    constructor(call,  {tokens}, subdomain) {
        this.call = call;
        this.access_token = tokens.access_token;
        this.subdomain = subdomain;
        this.authString = 'Bearer '.concat(this.access_token);
        this.config = {
            headers: {'Authorization': this.authString}
        };

    }

    async getContactInfo() {
        try {
            const response = await axios.get(`https://${this.subdomain}.amocrm.ru/api/v2/contacts?query=${this.call}`,
                this.config)
            return response.data
        } catch (e) {
            if (e) throw 'Error from getContactInfo' + e.data;
            console.log('Successful getContactInfo');
        }
    }

    async makeOptionsToCreateContact() {
        return {
            add: [{
                name: `${this.call}`,
                responsible_user_id: "",
                created_by: "",
                tags: "",
                custom_fields: [{code: "PHONE", values: [{value: `${this.call}`, enum: "WORK"}]}]
            }]
        };
    }

    async createContact(result) {
        try {
            const response = await axios.post(`https://${this.subdomain}.amocrm.ru/api/v2/contacts`,
                result,
                this.config);
            return response.data['_embedded']['items'][0]['id'];
        } catch (e) {
            if (e) throw 'Error from createContact: ' + e.data;
            console.log('Successful createContact: ');
        }
    }
}

module.exports = Contact;
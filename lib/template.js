const axios = require('axios');

class Template {
    constructor(number, tokens, subdomain, call) {
        this.number = number;
        this.access_token = tokens;
        this.subdomain = subdomain;
        this.call = call;
        this.authString = 'Bearer '.concat(this.access_token);
        this.config = {
            headers: {'Authorization': this.authString}
        };
    }

    async get(key, query) {
        try {
            let response = await axios.get(`https://${this.subdomain}.amocrm.ru/api/v2/${key}?${query}`,
                this.config);
            return response.status === 204 ? false : response.data;
        } catch (e) {
            if (e) console.log('Error from template.get() : ', e);
        }
    }

    async post(key, query) {
        try {
            let response = await axios.post(`https://${this.subdomain}.amocrm.ru/api/v2/${key}`,
                query,
                this.config);
            if (response.data['_embedded']['errors']) {
                return response.data['_embedded']['errors'];
            } else {
                return response.data;
            }
        } catch (e) {
            if (e) console.log('Error from template.post() : ', e);
        }
    }

    async makeReqCfg(key, query, entity) {
        if (key === 'leads' && entity === 'contacts') {
            return {
                add: [
                    {
                        name: `Новое обращение ${this.number}`,
                        contacts_id: [
                            query
                        ],
                        responsible_user_id: "3903739",
                        status_id: "30433699"
                    }
                ]
            }
        } else if (key === 'leads' && entity === 'companies') {
            return {
                add: [
                    {
                        name: `Новое обращение ${this.number}`,
                        company_id: query,
                        responsible_user_id: "3903739",
                        status_id: "30433699"
                    }
                ]
            }
        } else if (key === 'contacts') {
            return {
                add: [{
                    name: `${this.number}`,
                    responsible_user_id: "",
                    created_by: "",
                    tags: "",
                    custom_fields: [{code: "PHONE", values: [{value: `${this.number}`, enum: "WORK"}]}]
                }]
            };
        } else if (key === 'calls') {
            return {
                add: [{
                    phone_number: `${this.number}`,
                    link: this.call.voiceUrl || false,
                    source: '',
                    duration: this.call.duration,
                    direction: `${this.call.direction}`,
                    status: this.call.status
                }]
            }
        }
    }

}

module.exports = Template;
const axios = require('axios');

class Template {
    constructor(call, tokens, subdomain, key, query) {
        this.call = call;
        this.access_token = tokens;
        this.subdomain = subdomain;
        this.authString = 'Bearer '.concat(this.access_token);
        this.config = {
            headers: {'Authorization': this.authString}
        };
        // this.key = key;
        // this.query = query;
    }

    async get(key, query) {
        try {
            let response = await axios.get(`https://${this.subdomain}.amocrm.ru/api/v2/${key}?${query}`,
                this.config);
            return response.status === 204 ? false : response.data;
        } catch (e) {
            if (e) console.log('Error from template.get() : ', e);
            console.log('data received successfully');
        }
    }

    async post(key, query) {
        try {
            let response = await axios.post(`https://${this.subdomain}.amocrm.ru/api/v2/${key}`,
                query,
                this.config);
            return response.data;
        } catch (e) {
            if (e) console.log('Error from template.post() : ', e);
            console.log('data sent successfully');
        }
    }

    async makeReqCfg(key, query) {
        if (key === 'leads') {
            return {
                add: [
                    {
                        name: `Новое обращение ${this.call}`,
                        contacts_id: [
                            query
                        ],
                        responsible_user_id: "3903739",
                        status_id: "30433699"
                    }
                ]
            }
        } else if (key === 'contacts') {
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
    }

}

module.exports = Template;
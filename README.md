Итак, теперь всё работает тем образом, которым мне бы хотелось, чтобы это работало в данный момент, а именно:
    
    Теперь мы можем развёртывать модуль авторизации непосредственно из папки установки, то есть:
    1) Мы с вами выполняем npm install amocrm-oauth2 в какой-либо директории
    2) Оттуда же мы можем выполнить в консоли следующую команду:
     ./node_modules/.bin/deploy your-folder-name your-subdomain
    3) Таким образом будут созданы файлы для работы с авторизацией amoCRM (options.js, tokens.js, newAuth.js)
    
Далее:

    1) Нам необходимо корректно заполнить файл options.js
    (нашими данными из интеграции в амо) и пройти этап авторизации,
    для этого открываем newAuth.js(в созданной модулем папке) и вызываем один из методов:
```javascript
    // для получения первичных токенов(access_token и refresh_token)
    getTokens().then(console.log);
    
    // для их обновления.
    refreshTokens().then(console.log);
     
    //В планах завезти автоматизацию для этого процесса.
    
    // 2) После инициализации класса в созданной модулем директории нам необходимо создать любой js файл.
    // В нём нам необходимо подтянуть template.js из папки ./node_modules/amocrm-oauth2/lib а-ля 
    const Template = require('./node_modules/amocrm-oauth2/lib/template.js');
    
    //а также наш токен 
    const tokens = require('./tokens').tokens.access_token;
    
    // И инициализировать уже другой класс а-ля 
    let t = new Template(89504206666, tokens, 'rogaicopyta', call);
    
    // Где первым параметров мы указываем номер, с которым будем работать
    // (это может быть переменная, если вы решите использовать мой модуль
    // для серьёзной работы и принимать входящие звонки на сервер)
    // затем идёт tokens -- это Ваш refresh_token, который вы получили в пункте 1.
    // и последний принимаемый классом параметр -- это subdomain(например rogaicopyta.amocrm.ru, 
    // где сабдомен это rogaicopyta);
    // также, если вы принимаете звонки на сервер, присваивая пришедшую информацию о звонке в переменную,
    // то последним праметром call передаём именно её. (поступивший звонок)
```
    
    3) Таким образом нам доступны следующие методы:
    
    
```javascript
    // где key -- это метод получения данных с помощью API amoCRM(пока работает только с contacts и leads)
    t.get(key, query).then(console.log);
    
    // где key -- это опять же contacts или leads(своего рода маркер для того, чтобы скрипт понял
    // какую структуру запроса ему нужно отправить)
    // query -- это переданные нами данные
    // в свою очередь entity -- это дополнительный фильтр сущности(contacts, companies)
    // т.к. в зависимости от выбранной сущности несколько видоизменяется структура запроса к CRM
    t.makeReqCfg(key, query, entity).then(console.log); 
    
    //  key -- то же самое, что и выше, а query -- это результат работы метода makeReqCfg(); 
    t.post(key, query).then(console.log)
    // t.post -- это метод для того, чтобы мы могли отправить данные с помощью API amoCRM;
``` 
Ниже оставлю в качестве примера реализацию базовой логики на создание контакта/компании/сделки
и добавление записи звонка в примечание:
    

```javascript

    const Template = require('./template');
    
    
    const tokens = require('./tokens').tokens.access_token;
    const number = '88005553535';
    
    const call = {
        status: 'ANSWER',
        direction: 'incoming',
        voiceUrl: 'https://example.mp3',
        duration: 6,
        base_id: 7,
        sub_id: 7
    };
    
    let t = new Template(number, tokens, 'rogaicopyta', call);
    
    async function waiter() {
    
        try {
            // обрезаем входящий номер на одну цифру слева, чтобы amo могла лучше его обработать
            // следом делаем get запрос по поиску контактов с данным номером
            let existingContacts = await t.get('contacts', `query=${number.substr(1)}`);
            // если вернулось false, что значит, что контакт не найден
            if (existingContacts === false) {
                // мы так же проверяем компании, т.к. это разные сущности
                let existingCompanies = await t.get('companies', `query=${number.substr(1)}`);
                // если вообще ничего нет, т.е. ни контакта, ни компании
                if (existingCompanies === false) {
                    // сперва формируем запрос на создание контакта
                    let contactReqCfg = await t.makeReqCfg('contacts');
                    // затем создаём контакт с текущим номером звонящего(тут пока не ясно, как выстроить логику,
                    // что именно создавать в случае отстутсвия обеих сущностей.
                    let reqToContactCreating = await t.post('contacts', contactReqCfg);
                    // формируем запрос на создание сделки, передав id только что созданного контакта в качестве query
                    let leadReqCfg = await t.makeReqCfg('leads', reqToContactCreating['_embedded']['items'][0]['id'], 'contacts');
                    // создаём сделку
                    let reqToLeadCreating = await t.post('leads', leadReqCfg);
                    // дальше по тому же принципу добавляем запись разговора
                    let callReqCfg = await t.makeReqCfg('calls');
                    return await t.post('calls', callReqCfg);
                } else {
                    // если нам удалось найти компанию, то мы ищем сделки внутри неё
                    let existingLeadsInCompany = await t.get('leads', `id=${existingCompanies['_embedded']['items'][0]['leads']['id']}`);
                    // если сделок по найденной компании нет, тогда создаём её
                    if (existingLeadsInCompany === false) {
                        // затем формируем запрос на создание сделки, указывая в entity, что сделка будет создана для компании
                        // это необходимо, т.к. несколько меняется структура запроса в зависимости от искомой до этого сущности
                        let leadReqCfg = await t.makeReqCfg('leads', existingCompanies['_embedded']['items'][0]['leads']['id'], 'companies');
                        // создаём сделку
                        let reqToLeadCreating = await t.post('leads', leadReqCfg);
                        // по аналогии создаём и добавляем звонок
                        let callReqCfg = await t.makeReqCfg('calls');
                        return await t.post('calls', callReqCfg);
                    } else {
                        // если сделки найдены, давайте присвоим их в переменную leads для удобства
                        let leads = existingLeadsInCompany['_embedded']['items'];
                        // затем отфильтруем по статусам
                        const filter = (lead) => lead['status_id'] !== 143 || lead['status_id'] !== 142;
                        if (leads.some(filter)) {
                            // если находим активную сделку(!== 143 || !== 142)
                            // не будем дублировать, просто запишем в неё запись разговора
                            let callReqCfg = await t.makeReqCfg('calls');
                            return await t.post('calls', callReqCfg);
                        } else {
                            // в противном случае, если же все сделки неактивны,
                            let leadReqCfg = await t.makeReqCfg('leads', leads[0]['company']['id'], 'companies');
                            // мы создаём сделку и добавляем в неё запись разговора.
                            let reqToLeadCreating = await t.post('leads', leadReqCfg, 'companies');
                            let callReqCfg = await t.makeReqCfg('calls');
                            return await t.post('calls', callReqCfg);
                        }
                    }
                }
            } else {
                // с контактами работаем по аналогии, единственное, что меняется -- передаваемый параметр entity(выше объяснил причину)
                let existingLeadsInContact = await t.get('leads', `id=${existingContacts['_embedded']['items'][0]['leads']['id']}`);
                if (existingLeadsInContact === false) {
                    let leadReqCfg = await t.makeReqCfg('leads', existingContacts['_embedded']['items'][0]['id'], 'contacts');
                    let reqToLeadCreating = await t.post('leads', leadReqCfg, 'contacts');
                    let callReqCfg = await t.makeReqCfg('calls');
                    return await t.post('calls', callReqCfg);
                } else {
                    let leads = existingLeadsInContact['_embedded']['items'];
                    const filter = (lead) => lead['status_id'] !== 143 || lead['status_id'] !== 142;
                    if (leads.some(filter)) {
                        let callReqCfg = await t.makeReqCfg('calls');
                        return await t.post('calls', callReqCfg);
                    } else {
                        let leadReqCfg = await t.makeReqCfg('leads', leads[0]['company']['id'], 'contacts');
                        let reqToLeadCreating = await t.post('leads', leadReqCfg, 'contacts');
                        let callReqCfg = await t.makeReqCfg('calls');
                        return await t.post('calls', callReqCfg);
                    }
                }
            }
        } catch (e) {
            if (e) console.log('global error: ', e);
        }
    }
    
    waiter().then(console.log);
````

## Ребят, огромная просьба:

### если вы видите, что я где-либо закосячил, сообщите, пожалуйста, об этом

### также, если у вас есть какие-либо пожелания, идеи, которые можно было бы привнести в работу модуля, сообщайте.
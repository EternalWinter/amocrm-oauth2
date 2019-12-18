Итак, теперь всё работает тем образом, которым мне бы хотелось, чтобы это работало в данный момент, а именно:
    
    Теперь мы можем развёртывать модуль авторизации непосредственно из папки установки, то есть:
    1) Мы с вами выполняем npm install amocrm-oauth2 в какой-либо директории
    2) Оттуда же мы можем выполнить в консоли следующую команду:
     ./node_modules/.bin/deploy your-folder-name your-subdomain
    3) Таким образом будут созданы файлы для работы с авторизацией amoCRM (options.js, tokens.js, newAuth.js)
    
Далее:

    1) Нам необходимо корректно заполнить файл options.js
    (нашими данными из интеграции в амо) и пройти этап авторизации,
    для этого открываем newAuth.js(созданная модулем папка) и вызываем один из методов:
```javascript
    // для получения первичных токенов(access_token и refresh_token)
    getTokens().then(console.log);
    
    // для их обновления.
    refreshTokens().then(console.log);
     
    //В планах завезти автоматизацию для этого процесса.
    
    // 2) После инициализации класса в созданной модулем директории нам необходимо создать любой js файл.
    // В нём нам необходимо подтянуть template.js из папки ./node_modules/amocrm-oauth2/lib а-ля 
    const Template = require(/path/to/module/template.js);
    
    //а также наш токен 
    const tokens = require('./tokens').tokens.access_token;
    
    // И инициализировать уже другой класс а-ля 
    let t = new Template(89504206666, tokens, 'example');
    
    // Где первым параметров мы указываем номер, с которым будем работать
    // (это может быть переменная, если вы решите использовать мой модуль
    // для серьёзной работы и принимать входящие звонки на сервер)
    // затем идёт tokens -- это Ваш refresh_token, который вы получили в пункте 1.
    // и последний принимаемый классом параметр -- это subdomain(например rogaicopyta.amocrm.ru, 
    // где сабдомен это rogaicopyta);
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
    
    let t = new Template(number, tokens, 'example', call);
    
    
    try {
        // обрезаем входящий номер на одну цифру слева, чтобы amo могла лучше его обработать
        // следом делаем get запрос по поиску контактов с данным номером
        t.get('contacts', `query=${number.substr(1)}`).then(result => {
            // если вернулось false, что значит, что контакт не найден
            if (result === false) {
                // мы так же проверяем компании, т.к. это разные сущности
                t.get('companies', `query=${number.substr(1)}`).then(result => {
                    // если вообще ничего нет, т.е. ни контакта, ни компании
                    if (result === false) {
                        // сперва формируем запрос на создание контакта
                        t.makeReqCfg('contacts').then(result => {
                            // затем создаём контакт с текущим номером звонящего(тут пока не ясно, как выстроить логику,
                            // что именно создавать в случае отстутсвия обеих сущностей.
                            t.post('contacts', result).then(result => {
                                // формируем запрос на создание сделки, передав id только что созданного контакта в качестве query
                                t.makeReqCfg('leads', result['_embedded']['items'][0]['id'], 'companies').then(result => {
                                    // создаём сделку
                                    t.post('leads', result).then(result => {
                                        // дальше по тому же принципу добавляем запись разговора
                                        t.makeReqCfg('calls').then(result => {
                                            t.post('calls', result).then(console.log);
                                        })
                                    })
                                })
                            })
                        })
                    } else {
                        // если нам удалось найти компанию, то мы ищем сделки внутри неё
                        t.get('leads', `id=${result['_embedded']['items'][0]['leads']['id']}`).then(result => {
                            // если сделок по найденной компании нет, тогда создаём её
                            if (result === false) {
                                // вновь обращаемся к поиску компаний, чтобы получить её id
                                t.get('companies', `query=${number.substr(1)}`).then(result => {
                                    // затем формируем запрос на создание сделки, указывая в entity, что сделка будет создана для компании
                                    // это необходимо, т.к. несколько меняется структура запроса в зависимости от искомой до этого сущности
                                    t.makeReqCfg('leads', result['_embedded']['items'][0]['id'], 'companies').then(result => {
                                        t.post('leads', result).then(result => {
                                            t.makeReqCfg('calls').then(result => {
                                                t.post('calls', result).then(console.log);
                                            })
                                        })
                                    })
                                })
                            } else {
                                // если сделки найдены, давайте присвоим их в переменную leads для удобства
                                let leads = result['_embedded']['items'];
                                // затем отфильтруем по статусам
                                const filter = (lead) => lead['status_id'] !== 143 || lead['status_id'] !== 142;
                                if (leads.some(filter)) {
                                    // если находим активную сделку(!== 143 || !== 142)
                                    // не будем дублировать, просто запишем в неё запись разговора
                                    t.makeReqCfg('calls').then(result => {
                                        t.post('calls', result).then(console.log);
                                    })
                                } else {
                                    // в противном случае, если же все сделки неактивны,
                                    t.makeReqCfg('leads', leads[0]['company']['id'], 'companies').then(result => {
                                        // мы создаём сделку и записываем в неё запись разговора.
                                        t.post('leads', result).then(result => {
                                            t.makeReqCfg('calls').then(result => {
                                                t.post('calls', result).then(console.log);
                                            })
                                        });
                                    });
                                }
                            }
                        });
                    }
                })
            } else {
                // если же нам удалось найти контакт, то мы совершаем аналогичные проверки и соответствующие действия
                t.get('leads', `id=${result['_embedded']['items'][0]['leads']['id']}`).then(result => {
                    if (result === false) {
                        t.get('contacts', `query=${number.substr(1)}`).then(result => {
                            t.makeReqCfg('leads', result['_embedded']['items'][0]['id'], 'contacts').then(result => {
                                t.post('leads', result).then(result => {
                                    t.makeReqCfg('calls').then(result => {
                                        t.post('calls', result).then(console.log);
                                    })
                                })
                            })
                        })
                    } else {
                        let leads = result['_embedded']['items'];
                        const filter = (lead) => lead['status_id'] !== 143 || lead['status_id'] !== 142;
                        if (leads.some(filter)) {
                            t.makeReqCfg('calls').then(result => {
                                t.post('calls', result).then(console.log);
                            })
                        } else {
                            t.makeReqCfg('leads', leads[0]['main_contact']['id'], 'contacts').then(result => {
                                t.post('leads', result).then(result => {
                                    t.makeReqCfg('calls').then(result => {
                                        t.post('calls', result).then(console.log);
                                    })
                                })
                            });
                        }
                    }
                });
            }
        });
    } catch (e) {
        if (e) console.log('global error: ', e);
    }
````
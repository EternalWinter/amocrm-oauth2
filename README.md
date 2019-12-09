# amoCRM-oauth2.0-node.js
Небольшой модуль для авторизации Oauth2.0 в amoCRM. Реализация на node.js

Для работоспособности данного метода авторизации Вам необходимо создать в своём проекте amoCRM интеграцию, 
из которой в дальнейшем вы сможете получить 'client_id', 'client_secret', а так же Ваш 'code'. 

npm run deploy создаст в Вашем проекте все необходимые для прохождения авторизации файлы: options.js, tokens.js а также newAuth.js

Далее Вам необходимо внести Ваши 'client_id', 'client_secret', 'code', а также 'redirect_uri' в соответствующие поля options.js.

В файле options.js также имеется exports.refresh, в нём необходимо снять ковычки ("") со свойства refresh_token.

Далее потребуется лишь инициализировать новый экземпляр класса auth в class newAuth.js, передав необходимые параметры.

Установить пакет можно так же с помощью npm. https://www.npmjs.com/package/amocrm-oauth2

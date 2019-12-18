#!/usr/bin/env node


const fs = require('fs');
const template = require('./template.js');
const folder = process.argv[2] || 'test';


fs.mkdir(`./${folder}`, function () {

    fs.writeFile(`./${folder}/tokens.js`,
        'exports.tokens = ' + `${JSON.stringify(template.tokens)}`,
        function (error) {
            if (error) console.log('deploy tokens error: ', error);
        });

    fs.writeFile(`./${folder}/options.js`,
        'exports.options = ' + `${JSON.stringify(template.options)}` + '\n' + 'exports.refresh = ' + `${JSON.stringify(template.refresh)}`,
        function (error) {
            if (error) console.log('deploy options error: ', error);
        });

    fs.copyFile('./node_modules/amocrm-oauth2/src/newAuth.js', `./${folder}/newAuth.js`, (err) => {
        if (err) throw err;
        console.log('success copied')
    });


    fs.appendFile(`./${folder}/newAuth.js`,
        '\n' + `let ${process.argv[3]}Auth = new Auth(options, refresh, '${process.argv[3]}')`, function (error) {
            if (error) console.log('deploy auth.js error: ', error);
        });

});
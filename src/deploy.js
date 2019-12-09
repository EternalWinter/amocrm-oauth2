const fs = require('fs');
const template = require('./template.js');

fs.writeFile('./tokens.js',
	'exports.tokens = ' + `${JSON.stringify(template.tokens)}`,
	function (error) {
		if (error) console.log('deploy tokens error: ', error);
	});

fs.writeFile('./options.js',
	'exports.options = ' + `${JSON.stringify(template.options)}` + '\n'+ 'exports.refresh = ' + `${JSON.stringify(template.refresh)}`,
	function (error) {
		if (error) console.log('deploy options error: ', error);
	})

fs.writeFile('./newAuth.js',
	"const {tokens} = require(./tokens.js);" + "\n" + "const options = require('./options.js');" + "\n" + "const refresh = require('./options.js');" + "\n" + "const Auth = require('./lib/auth.js');", function (error) {
		if (error) console.log('deploy auth.js error: ', error);
	});

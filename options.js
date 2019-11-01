const { tokens } = require('./tokens.js');
const refresh_token = tokens.refresh_token;
exports.options = {
    "client_id": "****",
    "client_secret": "****",
    "grant_type": "authorization_code",
    "code": "***",
    "redirect_uri": "https://example.com"
}

exports.refresh = {
    "client_id": "****",
    "client_secret": "******",
    "grant_type": "refresh_token",
    "refresh_token": `${refresh_token}`,
    "redirect_uri": "https://example.com"
}

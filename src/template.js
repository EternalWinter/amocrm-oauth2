exports.tokens = {
    "token_type": "Bearer",
    "expires_in": 86400,
    "access_token": "xxxx",
    "refresh_token": "xxxx"
}

exports.options = {
    "client_id": "xxxx",
    "client_secret": "xxxx",
    "grant_type": "authorization_code",
    "code": "xxxx",
    "redirect_uri": "https://example.com"
};

exports.refresh = {
    "client_id": "xxxx",
    "client_secret": "xxxx",
    "grant_type": "refresh_token",
    "refresh_token": "`${require('./tokens.js').tokens.refresh_token}`",
    "redirect_uri": "https://example.com"
};

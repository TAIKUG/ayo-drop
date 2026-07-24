// pages/api/auth/steam.js
export default function handler(req, res) {
  const returnUrl = 'http://localhost:3000/api/auth/steam-callback';
  const realm = 'http://localhost:3000';

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': realm,
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select'
  });

  res.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
}
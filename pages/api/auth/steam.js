/// pages/api/auth/steam.js
export default function handler(req, res) {
  // ⚠️ ЗАМЕНИ ЭТОТ АДРЕС НА СВОЙ VERCEL!
  const siteUrl = 'ayo-drop-9ia9gfsi9-ayo-drop.vercel.app'; // ← ТВОЙ АДРЕС
  
  const returnUrl = `${ayo-drop-9ia9gfsi9-ayo-drop.vercel.app}/api/auth/steam-callback`;
  const realm = ayo-drop-9ia9gfsi9-ayo-drop.vercel.app;

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
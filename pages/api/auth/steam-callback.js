// pages/api/auth/steam-callback.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    if (!req.query['openid.claimed_id']) {
      return res.status(400).send('Нет данных от Steam');
    }

    const params = { ...req.query, 'openid.mode': 'check_authentication' };
    const response = await axios.post(
      'https://steamcommunity.com/openid/login',
      new URLSearchParams(params).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data.includes('is_valid:true')) {
      return res.status(403).send('Недействительный ответ от Steam');
    }

    const claimedId = req.query['openid.claimed_id'];
    const steamId = claimedId.split('/').pop();

    const apiKey = '661358F444F2632DDE5B819102F4C5F3';
    const profileRes = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const profile = profileRes.data.response.players[0];

    if (!profile) {
      return res.status(404).send('Профиль не найден');
    }

    // ✅ ВСЕГДА РЕДИРЕКТИМ НА TILDA С ПАРАМЕТРАМИ
    const tildaUrl = 'https://ayo-drop.tilda.ws';
    const redirectUrl = `${tildaUrl}/?auth=success&name=${encodeURIComponent(profile.personaname)}&avatar=${encodeURIComponent(profile.avatar)}&id=${steamId}`;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Вход выполнен</title></head>
        <body>
          <script>
            // ✅ СОХРАНЯЕМ ДАННЫЕ В localStorage
            localStorage.setItem('steam_user', JSON.stringify({
              name: '${profile.personaname}',
              avatar: '${profile.avatar}',
              uid: '${steamId}'
            }));
            // ✅ ПРОВЕРЯЕМ, ЕСТЬ ЛИ МЕТКА АДМИНКИ
            const isAdmin = localStorage.getItem('admin_redirect') === 'true';
            if (isAdmin) {
              localStorage.removeItem('admin_redirect');
              window.location.href = 'https://ayo-drop.vercel.app/admin';
            } else {
              window.location.href = '${redirectUrl}';
            }
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).send('Ошибка авторизации');
  }
}
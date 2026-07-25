// pages/api/auth/steam-callback.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Проверяем, что Steam вернул данные
    if (!req.query['openid.claimed_id']) {
      return res.status(400).send('Нет данных от Steam');
    }

    // Проверяем подлинность
    const params = { ...req.query, 'openid.mode': 'check_authentication' };
    const response = await axios.post(
      'https://steamcommunity.com/openid/login',
      new URLSearchParams(params).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data.includes('is_valid:true')) {
      return res.status(403).send('Недействительный ответ от Steam');
    }

    // Получаем SteamID (только цифры)
    const claimedId = req.query['openid.claimed_id'];
    const steamId = claimedId.split('/').pop(); // берём последнюю часть после /

    // Получаем профиль из Steam API
    const apiKey = '661358F444F2632DDE5B819102F4C5F3';
    const profileRes = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const profile = profileRes.data.response.players[0];

    // Редирект на Tilda с параметрами
    const tildaUrl = 'https://ayo-drop.tilda.ws';
    const redirectUrl = `${tildaUrl}/?auth=success&name=${encodeURIComponent(profile.personaname)}&avatar=${encodeURIComponent(profile.avatar)}&id=${steamId}`;

    // Отправляем HTML с редиректом
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Вход выполнен</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
          <script>
            window.location.href = '${redirectUrl}';
          </script>
        </head>
        <body>
          <p>Вход выполнен! Перенаправление...</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).send('Ошибка авторизации');
  }
}
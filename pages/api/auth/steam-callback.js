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

    // ✅ ВЫТАСКИВАЕМ ТОЛЬКО ЦИФРЫ STEAMID
    const claimedId = req.query['openid.claimed_id'];
    // Забираем всё, что после последнего слеша
    const steamId = claimedId.split('/').pop();

    const apiKey = 'ТВОЙ_API_КЛЮЧ'; // ← ЗАМЕНИ!
    const profileRes = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const profile = profileRes.data.response.players[0];

    const tildaUrl = 'https://ayo-drop.tilda.ws'; // ← ТВОЙ TILDA
    const redirectUrl = `${tildaUrl}/?auth=success&name=${encodeURIComponent(profile.personaname)}&avatar=${encodeURIComponent(profile.avatar)}&id=${steamId}`;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Вход выполнен</title></head>
        <body>
          <script>
            window.location.href = '${redirectUrl}';
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).send('Ошибка авторизации');
  }
}
✅ Что изменилось:
Было	Стало
steamId.replace('http://...', '')	steamId.split('/').pop() — берёт последнюю часть после слеша
Теперь вместо https://steamcommunity.com/openedid/76561199477971848 ты получишь просто 76561199477971848.

🚀 После замены:
bash
git add .
git commit -m "починил steamId"
git push
Сделай редеплой на Vercel, потом:

Очисти localStorage на Tilda (как делал)

Войди заново через Steam

Проверь в консоли: localStorage.getItem('steam_user') — теперь uid должен быть только цифры.

Попробуй и напиши, что получилось! 🔥

Ага, Ошибка авторизации — это значит, что steam-callback.js упал. Скорее всего, из-за того, что мы поменяли код, но не обновили API-ключ или что-то сломалось.

🔧 Давай вернём рабочий код и просто почистим SteamID правильно:
Замени содержимое pages/api/auth/steam-callback.js на ЭТОТ код:

javascript
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

    // ✅ Берём ТОЛЬКО цифры SteamID
    const claimedId = req.query['openid.claimed_id'];
    const steamId = claimedId.replace(/^.*\//, ''); // убираем всё до последнего слеша

    const apiKey = '661358F444F2632DDE5B819102F4C5F3';
    const profileRes = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const profile = profileRes.data.response.players[0];

    if (!profile) {
      return res.status(404).send('Профиль не найден в Steam');
    }

    const tildaUrl = 'https://ayo-drop.tilda.ws';
    const redirectUrl = `${tildaUrl}/?auth=success&name=${encodeURIComponent(profile.personaname)}&avatar=${encodeURIComponent(profile.avatar)}&id=${steamId}`;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Вход выполнен</title></head>
        <body>
          <script>
            window.location.href = '${redirectUrl}';
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).send('Ошибка авторизации: ' + error.message);
  }
}
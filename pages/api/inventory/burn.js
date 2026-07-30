// pages/api/inventory/burn.js
import admin from 'firebase-admin';

if (!admin.apps || !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Ошибка инициализации:', error.message);
  }
}

export default async function handler(req, res) {
  // Разрешаем CORS для Tilda
  res.setHeader('Access-Control-Allow-Origin', 'https://ayo-drop.tilda.ws');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const { steamId, itemId } = req.body;

  console.log('🔥 burn.js вызван для:', steamId, 'itemId:', itemId);

  if (!steamId || !itemId) {
    console.log('❌ Неверные данные');
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const userRef = admin.firestore().collection('users').doc(steamId);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log('❌ Пользователь не найден');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const userData = doc.data();
    const inventory = userData.inventory || [];

    console.log('📦 Инвентарь до удаления:', inventory.length);

    const itemIndex = inventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      console.log('❌ Скин не найден в инвентаре');
      return res.status(404).json({ error: 'Скин не найден' });
    }

    // Удаляем скин
    const removedItem = inventory.splice(itemIndex, 1);
    console.log('🗑️ Удалён скин:', removedItem[0]?.name);

    await userRef.update({ inventory: inventory });

    console.log('✅ Инвентарь обновлён, осталось:', inventory.length);

    return res.status(200).json({ 
      success: true, 
      message: 'Скин сожжён',
      remaining: inventory.length 
    });

  } catch (error) {
    console.error('❌ Ошибка сжигания:', error);
    return res.status(500).json({ 
      error: 'Ошибка сервера', 
      message: error.message 
    });
  }
}
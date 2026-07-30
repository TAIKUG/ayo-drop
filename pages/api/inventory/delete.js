// pages/api/inventory/delete.js
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
    console.log('✅ Firebase инициализирован');
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error.message);
  }
}

export default async function handler(req, res) {
  console.log('🚀 delete.js ВЫЗВАН');
  console.log('📌 Метод:', req.method);
  console.log('📌 Тело запроса:', req.body);

  res.setHeader('Access-Control-Allow-Origin', 'https://ayo-drop.tilda.ws');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS запрос обработан');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Метод не POST');
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const { steamId, itemId } = req.body;

  console.log('🆔 steamId:', steamId);
  console.log('🆔 itemId:', itemId);

  if (!steamId || !itemId) {
    console.log('❌ Неверные данные');
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    console.log('🔍 Ищем пользователя:', steamId);
    const userRef = admin.firestore().collection('users').doc(steamId);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log('❌ Пользователь не найден');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('✅ Пользователь найден');

    const userData = doc.data();
    const inventory = userData.inventory || [];

    console.log('📦 Всего скинов в инвентаре:', inventory.length);

    // Показываем ВСЕ ID скинов в инвентаре
    console.log('📋 ID скинов в инвентаре:', inventory.map(item => item.id).join(', '));

    const itemIndex = inventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      console.log('❌ Скин НЕ НАЙДЕН!');
      console.log('🔍 Ищем:', itemId);
      console.log('📋 Доступные ID:', inventory.map(item => item.id).join(', '));
      return res.status(404).json({ 
        error: 'Скин не найден', 
        searchedId: itemId,
        availableIds: inventory.map(item => item.id)
      });
    }

    console.log('✅ Скин найден! Удаляем:', inventory[itemIndex].name);
    inventory.splice(itemIndex, 1);
    await userRef.update({ inventory: inventory });

    console.log('✅ Скин удалён. Осталось:', inventory.length);

    return res.status(200).json({ 
      success: true, 
      remaining: inventory.length 
    });

  } catch (error) {
    console.error('❌ Ошибка удаления:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
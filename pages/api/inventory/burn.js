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

  if (!steamId || !itemId) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const userRef = admin.firestore().collection('users').doc(steamId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const userData = doc.data();
    const inventory = userData.inventory || [];

    const itemIndex = inventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Скин не найден' });
    }

    inventory.splice(itemIndex, 1);
    await userRef.update({ inventory: inventory });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Ошибка сжигания:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
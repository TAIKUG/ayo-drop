// pages/api/inventory/add.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const { steamId, items } = req.body;

  if (!steamId || !items || !items.length) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const docRef = admin.firestore().collection('inventory').doc(steamId);
    const doc = await docRef.get();

    // Добавляем каждому предмету уникальный ID и время получения
    const newItems = items.map(item => ({
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      receivedAt: new Date().toISOString()
    }));

    if (doc.exists) {
      // Если документ есть — добавляем новые предметы в массив
      await docRef.update({
        items: admin.firestore.FieldValue.arrayUnion(...newItems),
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Если документа нет — создаём новый
      await docRef.set({
        items: newItems,
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({ success: true, added: newItems.length });
  } catch (error) {
    console.error('Ошибка добавления скинов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
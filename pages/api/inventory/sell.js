// pages/api/inventory/sell.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const { steamId, itemId } = req.body;

  if (!steamId || !itemId) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const docRef = admin.firestore().collection('inventory').doc(steamId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Инвентарь не найден' });
    }

    const items = doc.data().items || [];
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Скин не найден' });
    }

    const soldItem = items[itemIndex];

    // Удаляем скин из инвентаря
    items.splice(itemIndex, 1);
    await docRef.update({
      items: items,
      lastUpdated: new Date().toISOString()
    });

    // Добавляем баланс пользователю
    const userRef = admin.firestore().collection('users').doc(steamId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const currentBalance = userDoc.data().balance || 0;
      await userRef.update({
        balance: currentBalance + soldItem.price,
        lastUpdated: new Date().toISOString()
      });
    } else {
      await userRef.set({
        balance: soldItem.price,
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({ success: true, item: soldItem });
  } catch (error) {
    console.error('Ошибка продажи скина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
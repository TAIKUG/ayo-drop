// pages/api/inventory/add.js
import admin from 'firebase-admin';

// ===== ИНИЦИАЛИЗАЦИЯ FIREBASE =====
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
    console.error('❌ Ошибка инициализации:', error.message);
  }
}

// ===== ОСНОВНАЯ ФУНКЦИЯ =====
export default async function handler(req, res) {
  // ===== CORS HEADERS =====
  res.setHeader('Access-Control-Allow-Origin', 'https://ayo-drop.tilda.ws');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Если это preflight-запрос (OPTIONS) — сразу отвечаем
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    const newItems = items.map(item => ({
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      receivedAt: new Date().toISOString()
    }));

    if (doc.exists) {
      await docRef.update({
        items: admin.firestore.FieldValue.arrayUnion(...newItems),
        lastUpdated: new Date().toISOString()
      });
    } else {
      await docRef.set({
        items: newItems,
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({ success: true, added: newItems.length });
  } catch (error) {
    console.error('❌ Ошибка добавления скинов:', error);
    res.status(500).json({ error: 'Ошибка сервера', message: error.message });
  }
}
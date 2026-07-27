// pages/api/admin/add-balance.js
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

  const { steamId, amount } = req.body;

  if (!steamId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const userRef = admin.firestore().collection('users').doc(steamId);
    const userDoc = await userRef.get();

    let currentBalance = 0;
    if (userDoc.exists) {
      currentBalance = userDoc.data().balance || 0;
    }

    await userRef.set({
      balance: currentBalance + amount,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, newBalance: currentBalance + amount });
  } catch (error) {
    console.error('Ошибка выдачи баланса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
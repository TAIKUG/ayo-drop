// pages/api/inventory/get.js

// ✅ ПРАВИЛЬНЫЙ импорт для firebase-admin 14.x.x
import * as admin from 'firebase-admin';

// Проверяем, инициализирован ли Firebase
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

export default async function handler(req, res) {
  const { steamId } = req.query;

  if (!steamId) {
    return res.status(400).json({ error: 'Не указан Steam ID' });
  }

  try {
    const db = admin.firestore();
    const doc = await db.collection('inventory').doc(steamId).get();
    const items = doc.exists ? doc.data().items || [] : [];
    res.json({ items });
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({ 
      error: 'Ошибка сервера', 
      message: error.message 
    });
  }
}
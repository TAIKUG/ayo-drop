// pages/api/balance/get.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export default async function handler(req, res) {
  const { steamId } = req.query;

  if (!steamId) {
    return res.status(400).json({ error: 'Не указан Steam ID' });
  }

  try {
    const doc = await admin.firestore().collection('users').doc(steamId).get();
    const balance = doc.exists ? doc.data().balance || 0 : 0;
    res.json({ balance });
  } catch (error) {
    console.error('Ошибка получения баланса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
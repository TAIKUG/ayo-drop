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
  const { steamId } = req.query;

  if (!steamId) {
    return res.status(400).json({ error: 'Не указан Steam ID' });
  }

  try {
    const doc = await admin.firestore().collection('inventory').doc(steamId).get();
    const items = doc.exists ? doc.data().items || [] : [];
    res.json({ items });
  } catch (error) {
    console.error('Ошибка получения инвентаря:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
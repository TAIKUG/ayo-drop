import admin from 'firebase-admin';

if (!admin.apps || !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ayo-drop.tilda.ws');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Метод не разрешён' });

  try {
    const snapshot = await admin.firestore()
      .collection('drops')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const drops = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      drops.push({
        user: data.user,
        item: data.item,
        price: data.price,
        case: data.case || 'Неизвестный кейс'
      });
    });

    res.json({ drops });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
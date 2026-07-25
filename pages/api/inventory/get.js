import admin from 'firebase-admin';

// ===== ИНИЦИАЛИЗАЦИЯ =====
if (!admin.apps.length) {
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
    // Не падаем, а просто логируем
  }
}

export default async function handler(req, res) {
  console.log('📥 Запрос к /api/inventory/get');
  console.log('📌 steamId:', req.query.steamId);

  const { steamId } = req.query;

  if (!steamId) {
    console.log('❌ Нет steamId');
    return res.status(400).json({ error: 'Не указан Steam ID' });
  }

  try {
    console.log('🔍 Ищем в Firestore...');
    const db = admin.firestore();
    const doc = await db.collection('inventory').doc(steamId).get();
    console.log('📄 Документ существует?', doc.exists);
    
    const items = doc.exists ? doc.data().items || [] : [];
    console.log('📦 Найдено скинов:', items.length);
    
    res.json({ items });
  } catch (error) {
    console.error('❌ Ошибка выполнения:', error.message);
    console.error('📋 Стек:', error.stack);
    res.status(500).json({ 
      error: 'Ошибка сервера', 
      message: error.message,
      stack: error.stack 
    });
  }
}
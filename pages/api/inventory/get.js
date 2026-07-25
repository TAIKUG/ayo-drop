export default async function handler(req, res) {
  // Проверяем переменные окружения
  const envCheck = {
    PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
  };
  
  // Если нет PRIVATE_KEY — сразу показываем ошибку
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ 
      error: 'Нет FIREBASE_PRIVATE_KEY',
      env: envCheck 
    });
  }

  const { steamId } = req.query;

  if (!steamId) {
    return res.status(400).json({ error: 'Не указан Steam ID' });
  }

  try {
    // Просто возвращаем тестовые данные, чтобы проверить, что API работает
    res.json({ 
      status: 'ok', 
      steamId: steamId,
      env: envCheck,
      message: 'API работает, но Firebase не подключён' 
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
}
// pages/admin.js
import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [balanceAmount, setBalanceAmount] = useState(100);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ МАССИВ АДМИНОВ (добавляй сюда Steam ID)
  const ADMIN_STEAM_IDS = [
    '76561199477971848',  // ← ТВОЙ
    '76561199826333690',  // ← ДРУГОЙ АДМИН (замени на реальный ID)
  ];

  useEffect(() => {
    const userData = localStorage.getItem('steam_user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        // ✅ ПРОВЕРЯЕМ, ЕСТЬ ЛИ ID В МАССИВЕ АДМИНОВ
        if (ADMIN_STEAM_IDS.includes(parsed.uid)) {
          setIsAuthorized(true);
          loadUsers();
        } else {
          setIsAuthorized(false);
        }
      } catch (e) {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
    setLoading(false);
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ ВЫДАТЬ БАЛАНС
  async function giveBalance(steamId, amount) {
    if (!steamId || !amount || amount <= 0) {
      alert('Введите сумму');
      return;
    }

    try {
      const res = await fetch('/api/admin/add-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId, amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${amount} ₽ выдано пользователю ${steamId}`);
        loadUsers();
      } else {
        alert('❌ Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('❌ Ошибка запроса');
    }
  }

  // ✅ СПИСАТЬ БАЛАНС
  async function subtractBalance(steamId, amount) {
    if (!steamId || !amount || amount <= 0) {
      alert('Неверная сумма');
      return;
    }

    if (!confirm(`Списать ${amount} ₽ у пользователя ${steamId}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/subtract-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId, amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${amount} ₽ списано у пользователя ${steamId}`);
        loadUsers();
      } else {
        alert('❌ Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('❌ Ошибка запроса');
    }
  }

  function goToSteamLogin() {
    localStorage.setItem('admin_redirect', 'true');
    window.location.href = '/api/auth/steam';
  }

  // ===== НЕ АВТОРИЗОВАН =====
  if (!user) {
    return (
      <div style={{ background: '#0a0b14', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Arial' }}>
        <div style={{ background: 'rgba(18,21,34,0.6)', padding: '40px', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2>🔐 Админ-панель</h2>
          <p style={{ color: '#6f7689', marginTop: '12px' }}>Войдите через Steam, чтобы получить доступ</p>
          <button 
            onClick={goToSteamLogin}
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #6e38e7, #9d73ff)',
              color: '#fff',
              borderRadius: '30px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >Войти через Steam</button>
        </div>
      </div>
    );
  }

  // ===== АВТОРИЗОВАН, НО НЕ АДМИН =====
  if (user && !ADMIN_STEAM_IDS.includes(user.uid)) {
    return (
      <div style={{ background: '#0a0b14', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Arial' }}>
        <div style={{ background: 'rgba(18,21,34,0.6)', padding: '40px', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2>⛔ Доступ запрещён</h2>
          <p style={{ color: '#ff6b6b', marginTop: '12px' }}>У вас нет прав администратора</p>
          <p style={{ color: '#6f7689', fontSize: '14px', marginTop: '8px' }}>Ваш Steam ID: {user.uid}</p>
          <a href="/" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 25px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#b9bdcf',
            borderRadius: '30px',
            textDecoration: 'none'
          }}>Вернуться на главную</a>
        </div>
      </div>
    );
  }

  // ===== АДМИН ПАНЕЛЬ =====
  return (
    <div style={{ background: '#0a0b14', minHeight: '100vh', color: '#fff', fontFamily: 'Arial', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(18,21,34,0.6)', borderRadius: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2>🛠️ Админ-панель</h2>
            <span style={{ fontSize: '13px', color: '#6f7689', background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: '999px' }}>{user.name}</span>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('steam_user'); window.location.reload(); }} 
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#b9bdcf', padding: '8px 20px', borderRadius: '999px', cursor: 'pointer' }}
          >🚪 Выйти</button>
        </div>

        <div style={{ background: 'rgba(18,21,34,0.4)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
          <h3>💰 Выдача баланса</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
            <input 
              type="text" 
              placeholder="Steam ID" 
              value={selectedUser} 
              onChange={e => setSelectedUser(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #333', background: '#1a1d2e', color: '#fff', minWidth: '200px' }}
            />
            <input 
              type="number" 
              placeholder="Сумма" 
              value={balanceAmount} 
              onChange={e => setBalanceAmount(Number(e.target.value))}
              style={{ width: '150px', padding: '12px', borderRadius: '10px', border: '1px solid #333', background: '#1a1d2e', color: '#fff' }}
            />
            <button 
              onClick={() => giveBalance(selectedUser, balanceAmount)}
              style={{ padding: '12px 30px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #45e0a8, #20a978)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >Выдать</button>
          </div>
        </div>

        <div style={{ background: 'rgba(18,21,34,0.4)', borderRadius: '24px', padding: '24px' }}>
          <h3>👥 Пользователи ({users.length})</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6f7689' }}>Загрузка...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6f7689' }}>Нет пользователей</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6f7689' }}>Steam ID</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6f7689' }}>Баланс</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6f7689' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '13px' }}>{user.uid}</td>
                      <td style={{ padding: '12px', color: '#45e0a8', fontWeight: 'bold' }}>{user.balance?.toFixed(2) || '0.00'} ₽</td>
                      <td style={{ padding: '12px' }}>
                        {/* ✅ КНОПКИ + БАЛАНС */}
                        <button 
                          onClick={() => giveBalance(user.uid, 100)}
                          style={{ background: 'rgba(69,224,168,0.1)', border: '1px solid rgba(69,224,168,0.2)', color: '#45e0a8', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' }}
                        >+100</button>
                        <button 
                          onClick={() => giveBalance(user.uid, 500)}
                          style={{ background: 'rgba(69,224,168,0.1)', border: '1px solid rgba(69,224,168,0.2)', color: '#45e0a8', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' }}
                        >+500</button>
                        <button 
                          onClick={() => giveBalance(user.uid, 1000)}
                          style={{ background: 'rgba(69,224,168,0.1)', border: '1px solid rgba(69,224,168,0.2)', color: '#45e0a8', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' }}
                        >+1000</button>
                        {/* ✅ КНОПКИ - БАЛАНС */}
                        <button 
                          onClick={() => subtractBalance(user.uid, 100)}
                          style={{ background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.2)', color: '#ff4545', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' }}
                        >-100</button>
                        <button 
                          onClick={() => subtractBalance(user.uid, 500)}
                          style={{ background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.2)', color: '#ff4545', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' }}
                        >-500</button>
                        <button 
                          onClick={() => subtractBalance(user.uid, 1000)}
                          style={{ background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.2)', color: '#ff4545', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}
                        >-1000</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
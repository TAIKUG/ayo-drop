import { useEffect, useState } from 'react';

export default function Inventory() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('steam_user');
    if (data) {
      const userData = JSON.parse(data);
      setUser(userData);
      fetchInventory(userData.uid);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchInventory(steamId) {
    try {
      const res = await fetch(`/api/inventory/get?steamId=${steamId}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sellItem(itemId) {
    if (!confirm('Продать этот скин?')) return;
    try {
      const res = await fetch('/api/inventory/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId: user.uid, itemId })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Скин продан за ${data.item.price} ₽`);
        fetchInventory(user.uid);
      }
    } catch (error) {
      alert('Ошибка продажи');
    }
  }

  if (!user) {
    return (
      <div style={{ background: '#0a0b14', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Arial' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🔑 Войдите через Steam</h2>
          <a href="/api/auth/steam" style={{ background: '#6e38e7', color: '#fff', padding: '12px 30px', borderRadius: '30px', textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>Войти</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0b14', minHeight: '100vh', color: '#fff', fontFamily: 'Arial', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(18,21,34,0.6)', borderRadius: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={user.avatar} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #8b5cf6' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ fontSize: '13px', color: '#6f7689' }}>🆔 {user.uid}</div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('steam_user'); window.location.reload(); }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#b9bdcf', padding: '8px 20px', borderRadius: '999px', cursor: 'pointer' }}>🚪 Выйти</button>
        </div>

        <div style={{ background: 'rgba(18,21,34,0.4)', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ marginBottom: '20px' }}>🎒 Мой инвентарь <span style={{ fontSize: '14px', color: '#6f7689' }}>({items.length})</span></h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#6f7689' }}>Загрузка...</div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#6f7689' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎒</div>
              У вас пока нет скинов
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ background: 'rgba(18,21,34,0.6)', borderRadius: '16px', padding: '12px', textAlign: 'center', border: `1px solid ${item.rarity || 'rgba(255,255,255,0.05)'}` }}>
                  <img src={item.image} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', margin: '8px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#45e0a8' }}>{item.price} ₽</div>
                  <button onClick={() => sellItem(item.id)} style={{ background: 'rgba(69,224,168,0.1)', border: '1px solid rgba(69,224,168,0.2)', color: '#45e0a8', padding: '4px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', width: '100%', marginTop: '8px' }}>💰 Продать</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
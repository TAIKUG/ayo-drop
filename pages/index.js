// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('steam_user');
    if (data) setUser(JSON.parse(data));
  }, []);

  const logout = () => {
    localStorage.removeItem('steam_user');
    setUser(null);
  };

  return (
    <div style={{ 
      background: '#080a12', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }}>
      <div style={{
        background: 'rgba(18, 21, 34, 0.9)',
        padding: '40px 50px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {user ? (
          <>
            <img src={user.avatar} style={{ width: '80px', borderRadius: '50%', border: '3px solid #6e38e7' }} alt="Avatar" />
            <h2>{user.name}</h2>
            <p style={{ color: '#9299ad' }}>Steam ID: {user.uid}</p>
            <p style={{ color: '#45e0a8', marginTop: '15px' }}>✅ Вы вошли</p>
            <button onClick={logout} style={{
              marginTop: '15px',
              padding: '10px 30px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '30px',
              cursor: 'pointer'
            }}>🚪 Выйти</button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '28px' }}>🔑</h1>
            <h2>Вход через Steam</h2>
            <p style={{ color: '#9299ad' }}>Нажмите на кнопку, чтобы войти</p>
            <br />
            <a href="/api/auth/steam" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #6e38e7, #9d73ff)',
              color: '#fff',
              padding: '14px 35px',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>Войти через Steam</a>
          </>
        )}
      </div>
    </div>
  );
}
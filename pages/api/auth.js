// pages/auth.js
import { useEffect, useState } from 'react';

export default function AuthPage() {
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
      background: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {user ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(18,21,34,0.9)',
          padding: '8px 16px 8px 12px',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <img src={user.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #6e38e7' }} alt="Avatar" />
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
          <button onClick={logout} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#9299ad',
            padding: '4px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>Выйти</button>
        </div>
      ) : (
        <a href="/api/auth/steam" style={{
          background: 'linear-gradient(135deg, #6e38e7, #9d73ff)',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: '30px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '14px',
          display: 'inline-block',
          transition: '0.3s'
        }}>Войти через Steam</a>
      )}
    </div>
  );
}
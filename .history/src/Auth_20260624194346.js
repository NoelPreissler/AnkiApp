import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`http://193.197.231.68:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benutzername: username })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(isLogin ? 'Erfolgreich eingeloggt!' : 'Registrierung erfolgreich! Du kannst dich jetzt einloggen.');
        if (isLogin) {
          onLoginSuccess(data.user); // Übergibt das User-Objekt inkl. ID an App.jsx
        } else {
          setIsLogin(true);
        }
      } else {
        setMessage(data.error || 'Fehler aufgetreten');
      }
    } catch (error) {
      setMessage('Verbindung zum Server fehlgeschlagen.');
    }
  };

  return (
    <div style={styles.card}>
      <h2>{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Benutzername" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={styles.input}
        />
        <button type="submit" style={styles.submitBtn}>{isLogin ? 'Einloggen' : 'Konto erstellen'}</button>
      </form>
      {message && <p style={styles.msg}>{message}</p>}
      <p style={styles.toggle} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Noch kein Konto? Hier registrieren' : 'Bereits ein Konto? Hier einloggen'}
      </p>
    </div>
  );
}

const styles = {
  card: { padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '400px', margin: '40px auto', textAlign: 'center' },
  input: { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' },
  submitBtn: { width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  toggle: { marginTop: '15px', color: '#3498db', cursor: 'pointer', fontSize: '14px' },
  msg: { color: '#e67e22', fontSize: '14px', marginTop: '10px' }
};
import React from 'react';

export default function Navbar({ currentView, setCurrentView, user, onLogout }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🎓 VokabelApp</div>
      <div style={styles.menu}>
        <button onClick={() => setCurrentView('quiz')} style={currentView === 'quiz' ? styles.activeBtn : styles.btn}>Lernen</button>
        <button onClick={() => setCurrentView('upload')} style={currentView === 'upload' ? styles.activeBtn : styles.btn}>JSON Upload</button>
        {user ? (
          <div style={styles.userInfo}>
            <span>Hallo, {user.benutzername}</span>
            <button onClick={onLogout} style={styles.logoutBtn}>Abmelden</button>
          </div>
        ) : (
          <button onClick={() => setCurrentView('auth')} style={currentView === 'auth' ? styles.activeBtn : styles.btn}>Login / Registrieren</button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'between', alignItems: 'center', backgroundColor: '#2c3e50', padding: '10px 20px', color: 'white', fontFamily: 'sans-serif' },
  brand: { fontSize: '20px', fontWeight: 'bold', flexGrow: 1 },
  menu: { display: 'flex', gap: '15px', alignItems: 'center' },
  btn: { background: 'none', border: 'none', color: '#bdc3c7', cursor: 'pointer', fontSize: '16px' },
  activeBtn: { background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', borderBottom: '2px solid white' },
  userInfo: { display: 'flex', gap: '10px', alignItems: 'center' },
  logoutBtn: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
};
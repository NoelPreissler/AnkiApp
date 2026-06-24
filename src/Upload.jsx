import React, { useState } from 'react';

export default function Upload({ user }) {
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState('');

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '40px' }}>⚠️ Bitte logge dich zuerst ein, um Vokabeln hochzuladen.</div>;
  }

  const handleUpload = async () => {
    try {
      const parsedData = JSON.parse(jsonText);
      if (!Array.isArray(parsedData)) {
        setStatus('Das JSON muss ein Array von Objekten sein: [{"vorn": "...", "hinten": "..."}]');
        return;
      }

      const response = await fetch('http://localhost:5000/api/vokabeln/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benutzer_id: user.id, vokabeln: parsedData })
      });

      if (response.ok) {
        setStatus('🎉 Vokabeln erfolgreich in die Datenbank hochgeladen!');
        setJsonText('');
      } else {
        const err = await response.json();
        setStatus(`Fehler: ${err.error}`);
      }
    } catch (e) {
      setStatus('Ungültiges JSON-Format. Bitte überprüfe deine Syntax.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Eigene Vokabeln hochladen (JSON)</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>Formatbeispiel: <code>[{"{"}"vorn": "Apfel", "hinten": "apple"{"}"}]</code></p>
      <textarea 
        rows="10" 
        placeholder='Füge dein JSON hier ein...' 
        value={jsonText} 
        onChange={(e) => setJsonText(e.target.value)}
        style={styles.textarea}
      />
      <button onClick={handleUpload} style={styles.btn}>In Datenbank speichern</button>
      {status && <p style={styles.status}>{status}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '10px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #ccc' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
  status: { marginTop: '15px', fontWeight: 'bold', color: '#34495e' }
};
import React, { useState, useEffect } from 'react';

export default function Upload({ user }) {
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState('');
  const [uploadMode, setUploadMode] = useState('new'); // 'new' oder 'existing'
  const [existingSaetze, setExistingSaetze] = useState([]);
  const [selectedSatzName, setSelectedSatzName] = useState('');
  const [newSatzName, setNewSatzName] = useState('');

  // Wenn der Modus auf 'existing' wechselt, laden wir die Sätze des Nutzers aus der DB
  useEffect(() => {
    if (user && uploadMode === 'existing') {
      fetch(`http://193.197.231.68:5000/api/saetze/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setExistingSaetze(data);
          if (data.length > 0) {
            setSelectedSatzName(data[0].name); // Standardmäßig den ersten Satz wählen
          }
        })
        .catch(err => console.error("Fehler beim Laden der Sätze:", err));
    }
  }, [user, uploadMode]);

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '40px', color: '#e74c3c', fontWeight: 'bold' }}>⚠️ Bitte logge dich zuerst ein, um Vokabeln hochzuladen.</div>;
  }

  const handleUpload = async () => {
    // Welcher Name soll genutzt werden?
    const satzName = uploadMode === 'new' ? newSatzName : selectedSatzName;

    if (!satzName.trim()) {
      setStatus('Bitte gib einen Namen für den Vokabelsatz an.');
      return;
    }

    try {
      const parsedData = JSON.parse(jsonText);
      if (!Array.isArray(parsedData)) {
        setStatus('Das JSON muss ein Array von Objekten sein: [{"vorn": "...", "hinten": "..."}]');
        return;
      }

      const response = await fetch('http://193.197.231.68:5000/api/vokabeln/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          benutzer_id: user.id, 
          satz_name: satzName, 
          vokabeln: parsedData 
        })
      });

      if (response.ok) {
        setStatus(`🎉 Vokabeln erfolgreich im Satz "${satzName}" gespeichert!`);
        setJsonText('');
        setNewSatzName('');
        // Falls ein neuer Satz erstellt wurde, triggern wir ein kurzes Neuladen der Liste für das Dropdown
        if (uploadMode === 'new') setUploadMode('existing');
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
      
      {/* Modus-Auswahl */}
      <div style={styles.radioGroup}>
        <label style={styles.radioLabel}>
          <input 
            type="radio" 
            value="new" 
            checked={uploadMode === 'new'} 
            onChange={() => setUploadMode('new')} 
          />
          Neuen Vokabelsatz erstellen
        </label>
        <label style={styles.radioLabel}>
          <input 
            type="radio" 
            value="existing" 
            checked={uploadMode === 'existing'} 
            onChange={() => setUploadMode('existing')} 
          />
          An vorhandenen Satz anfügen
        </label>
      </div>

      {/* Dynamisches Namensfeld */}
      {uploadMode === 'new' ? (
        <input 
          type="text" 
          placeholder="Name des neuen Vokabelsatzes (z.B. Lektion 5)" 
          value={newSatzName}
          onChange={(e) => setNewSatzName(e.target.value)}
          style={styles.input}
        />
      ) : (
        <select 
          value={selectedSatzName} 
          onChange={(e) => setSelectedSatzName(e.target.value)} 
          style={styles.select}
        >
          {existingSaetze.length === 0 ? (
            <option disabled>Keine Sätze in der Datenbank vorhanden</option>
          ) : (
            existingSaetze.map(satz => (
              <option key={satz.id} value={satz.name}>{satz.name}</option>
            ))
          )}
        </select>
      )}

      <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
        Formatbeispiel: <code>[{"{"}"vorn": "Apfel", "hinten": "apple"{"}"}]</code>
      </p>
      
      <textarea 
        rows="8" 
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
  container: { width: '100%', maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  radioGroup: { display: 'flex', gap: '20px', marginBottom: '15px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', cursor: 'pointer' },
  input: { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '10px' },
  select: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '10px', backgroundColor: '#fff' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '10px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
  status: { marginTop: '15px', fontWeight: 'bold', color: '#34495e', textAlign: 'center' }
};
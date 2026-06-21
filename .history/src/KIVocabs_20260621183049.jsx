import React, { useState } from 'react';

export default function VokabelGenerator() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const holeVokabeln = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('http://193.197.231.68:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:0.5b ', // Dein blitzschnelles Modell
          prompt: 'Gib mir 5 Jura-Vokabeln auf Türkisch und Deutsch als JSON-Array.',
          stream: false, // Wichtig: Wartet, bis die Antwort komplett fertig ist
        }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Fehler beim Laden der KI:', error);
      setResponse('Fehler: Konnte Verbindung zu Ollama nicht herstellen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Jura Vokabel-Generator (Local KI)</h2>
      <button onClick={holeVokabeln} disabled={loading}>
        {loading ? 'KI überlegt...' : 'Vokabeln generieren'}
      </button>

      <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3>Ergebnis:</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {response || 'Noch keine Vokabeln generiert.'}
        </pre>
      </div>
    </div>
  );
}
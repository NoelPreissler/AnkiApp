import React, { useState } from 'react';

export default function VokabelGenerator() {
  const [inputText, setInputText] = useState(''); // State für die Benutzereingabe
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const konvertiereInJson = async () => {
    if (!inputText.trim()) {
      setResponse('Bitte gib zuerst ein paar Vokabeln ein.');
      return;
    }

    setLoading(true);
    setResponse(''); // Altes Ergebnis leeren

   try {
  setLoading(true);

  const res = await fetch('http://193.197.231.236:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemma3:4b', // Optimal für 8 GB RAM (schnell & präzise)
      prompt: `Du bist ein Daten-Parser. Deine einzige Aufgabe ist es, eine Liste von Vokabeln in ein JSON-Format zu verwandeln.
    
Nutze exakt dieses Format: [{"vorn": "Wort1", "hinten": "Wort2"}]
Hier ist die echte Eingabe des Benutzers, konvertiere sie jetzt:
${inputText}`,

      format: 'json', // Zwingt Ollama, nur JSON auszugeben
      stream: true,   // Aktiviert das ressourcenschonende Streaming
    }),
  });

  // Prüfen, ob der Server erreichbar ist
  if (!res.ok) {
    throw new Error(`Server-Fehler: ${res.status}`);
  }

  // Stream-Reader aufsetzen, um die Antwort Stück für Stück zu lesen
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let komplettesRawJson = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break; // Stream ist zu Ende

    // Chunk dekodieren (enthält oft mehrere Zeilen oder Fragmente)
    const chunk = decoder.decode(value, { stream: true });
    const zeilen = chunk.split('\n');

    for (const zeile of zeilen) {
      if (zeile.trim() !== "") {
        try {
          const parsedChunk = JSON.parse(zeile);
          // Ollama packt das generierte Textstück immer in das Feld .response
          komplettesRawJson += parsedChunk.response;
        } catch (e) {
          // Falls eine Zeile unvollständig war, wird sie im nächsten Durchlauf verarbeitet
          console.warn("Fehler beim Parsen eines Chunks, überspringe...", e);
        }
      }
    }
  }

  // Das fertige, zusammengesetzte JSON-Ergebnis schön formatiert anzeigen
  const schoenesJson = JSON.stringify(JSON.parse(komplettesRawJson), null, 2);
  setResponse(schoenesJson);

} catch (error) {
  console.error("Fehler beim Formatieren durch die KI:", error);
  setResponse('Fehler bei der Kommunikation mit der KI oder Zeitüberschreitung.');
} finally {
  setLoading(false); // Lade-Status wieder auf false setzen
}
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'left' }}>
      <h2>Jura Vokabel-Generator (Local KI)</h2>

      <p style={{ fontSize: '14px', color: '#666' }}>
        Gib deine Vokabeln flexibel ein (z.B. <code>Hund = köpek</code> oder untereinander):
      </p>

      <textarea
        rows="5"
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
        placeholder="Beispiel:&#10;Haus = ev&#10;Stuhl - sandalye"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={konvertiereInJson}
        disabled={loading}
        style={{ width: '100%', padding: '12px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'KI konvertiert Daten...' : 'In JSON umwandeln ⚡'}
      </button>

      <div style={{ marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '5px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ marginTop: 0 }}>Generiertes JSON-Format:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '14px' }}>
          {response || 'Noch kein JSON generiert.'}
        </pre>
      </div>
    </div>
  );
}
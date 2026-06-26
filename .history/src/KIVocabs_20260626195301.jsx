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
      const res = await fetch('http://193.197.231.236:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:7b', // Dein blitzschnelles Modell
          prompt: `Du bist ein Daten-Parser. Deine einzige Aufgabe ist es, eine Liste von Vokabeln, in ein JSON-Format zu verwandeln.
        
Nutze exakt dieses Format: [{"vorn": "Wort1", "hinten": "Wort2"}]
Hier ist die echte Eingabe des Benutzers, konvertiere sie jetzt:
${inputText}`, // Nutzt den Text aus der Textarea

          format: 'json', // Zwingt Ollama, nur JSON auszugeben
          stream: true,  // Wartet auf die vollständige Antwort
        }),
      });

      const data = await res.json();

      // Das rohe JSON-String-Ergebnis der KI lesbar formatiert (mit Einrückungen) anzeigen
      // data.response ist bereits ein valider JSON-String, wir machen ihn nur "schön"
      const schoenesJson = JSON.stringify(JSON.parse(data.response), null, 2);

      setResponse(schoenesJson);

    } catch (error) {
      console.error("Fehler beim Formatieren durch die KI:", error);
      setResponse('Fehler bei der Kommunikation mit der KI.');
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
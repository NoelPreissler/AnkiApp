import React, { useState, useEffect } from 'react';
// Hier importierst du all deine JSON-Dateien direkt!
import VokabelGenerator from './KIVocabs';
import juraVocabs from './bolum1.json';
import ela from './bolum2.json';
import drei from './bolum3.json'

// Ein zentrales Objekt, das alle deine Lektionen bündelt
const LEKTIONEN = {
  'Bölüm 1 (Türkisch)': juraVocabs,
  'Ela Vokabeln': ela,
  'Intermediate': drei
  // 'Lektion 2': lektion2Vocabs, <-- Hier einfach weitere hinzufügen
};

export default function App() {
  const [selectedLektion, setSelectedLektion] = useState(Object.keys(LEKTIONEN)[0]);
  // Neue State-Variable für die Richtung: 'de-tr' oder 'tr-de'
  const [richtung, setRichtung] = useState('de-tr'); 
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [initialCount, setInitialCount] = useState(0);

  // Fortschritt aus dem LocalStorage wiederherstellen, falls vorhanden
  useEffect(() => {
    const savedDeck = localStorage.getItem('anki_react_deck');
    if (savedDeck) {
      const parsed = JSON.parse(savedDeck);
      if (parsed.length > 0) {
        setDeck(parsed);
        setQuizStarted(true);
        setInitialCount(parseInt(localStorage.getItem('anki_react_total') || parsed.length));
      }
    }
  }, []);

  // Startet das Quiz mit der ausgewählten JSON-Lektion und Richtung
  const handleStartQuiz = () => {
    const rawData = LEKTIONEN[selectedLektion];
    if (!rawData || rawData.length === 0) return;

    // Normalisieren und Richtung berücksichtigen
    const normalizedDeck = rawData.map(item => {
      const originalVorn = item.vorn || Object.values(item)[0];
      const originalHinten = item.hinten || Object.values(item)[1];

      // Wenn 'tr-de' gewählt ist, tauschen wir einfach vorn und hinten
      return {
        vorn: richtung === 'tr-de' ? originalHinten : originalVorn,
        hinten: richtung === 'tr-de' ? originalVorn : originalHinten
      };
    });

    setDeck(normalizedDeck);
    setInitialCount(normalizedDeck.length);
    setCurrentIndex(0);
    setIsShowingAnswer(false);
    setQuizStarted(true);

    localStorage.setItem('anki_react_deck', JSON.stringify(normalizedDeck));
    localStorage.setItem('anki_react_total', normalizedDeck.length.toString());
  };

  // Karte war falsch -> wird ans Ende des Stapels geschoben
  const handleWrong = () => {
    const updatedDeck = [...deck];
    const currentCard = updatedDeck.splice(currentIndex, 1)[0];
    updatedDeck.push(currentCard); // hinten anhängen

    setDeck(updatedDeck);
    setIsShowingAnswer(false);
    localStorage.setItem('anki_react_deck', JSON.stringify(updatedDeck));
  };

  // Karte war richtig -> fliegt aus dem Stapel
  const handleCorrect = () => {
    const updatedDeck = [...deck];
    updatedDeck.splice(currentIndex, 1);

    setDeck(updatedDeck);
    setIsShowingAnswer(false);
    localStorage.setItem('anki_react_deck', JSON.stringify(updatedDeck));
  };

  const handleReset = () => {
    if (window.confirm("Möchtest du das aktuelle Deck beenden und zur Auswahl zurückkehren?")) {
      localStorage.removeItem('anki_react_deck');
      localStorage.removeItem('anki_react_total');
      setQuizStarted(false);
      setDeck([]);
    }
  };

  // Hilfsvariablen für die UI
  const currentCard = deck[currentIndex];
  const progressPercentage = initialCount > 0 ? ((initialCount - deck.length) / initialCount) * 100 : 100;

  return (
    <div style={styles.body}>
      {!quizStarted ? (
        /* SETUP VIEW */
        <div style={styles.container}>
          <h1 style={styles.title}>Anki Flashcards (React)</h1>
          <div style={styles.selectBox}>
            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>
              Wähle eine importierte JSON-Datei:
            </label>
            <select 
              value={selectedLektion} 
              onChange={(e) => setSelectedLektion(e.target.value)}
              style={styles.select}
            >
              {Object.keys(LEKTIONEN).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* NEU: Sprachauswahl */}
            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px', marginTop: '15px' }}>
              Sprachrichtung wählen:
            </label>
            <div style={styles.radioContainer}>
              <label style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="richtung" 
                  value="de-tr" 
                  checked={richtung === 'de-tr'} 
                  onChange={() => setRichtung('de-tr')}
                  style={styles.radioInput}
                />
                Deutsch → Türkisch
              </label>
              <label style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="richtung" 
                  value="tr-de" 
                  checked={richtung === 'tr-de'} 
                  onChange={() => setRichtung('tr-de')}
                  style={styles.radioInput}
                />
                Türkisch → Deutsch
              </label>
            </div>

            <button onClick={handleStartQuiz} style={{ ...styles.button, backgroundColor: '#2ecc71', marginTop: '20px' }}>
              Lektion starten
            </button>
          </div>
          <VokabelGenerator/>
        </div>
      ) : (
        /* QUIZ VIEW */
        <div style={styles.container}>
          <h2>{isShowingAnswer ? 'Antwort' : 'Frage'}</h2>
          
          <div 
            onClick={() => !isShowingAnswer && setIsShowingAnswer(true)}
            style={{ 
              ...styles.card, 
              backgroundColor: isShowingAnswer ? '#fffdf0' : '#f9f9f9',
              borderColor: isShowingAnswer ? '#f1c40f' : '#eee'
            }}
          >
            {deck.length === 0 ? (
              <span style={{ fontSize: '24px' }}>🎉 Alles gelernt! Super Job.</span>
            ) : (
              isShowingAnswer ? currentCard.hinten : currentCard.vorn
            )}
          </div>

          {deck.length > 0 && !isShowingAnswer && (
            <button onClick={() => setIsShowingAnswer(true)} style={styles.button}>
              Antwort aufdecken
            </button>
          )}

          {deck.length > 0 && isShowingAnswer && (
            <div style={styles.actionButtons}>
              <button onClick={handleWrong} style={{ ...styles.button, backgroundColor: '#e74c3c' }}>
                Falsch ❌
              </button>
              <button onClick={handleCorrect} style={{ ...styles.button, backgroundColor: '#2ecc71' }}>
                Gewusst! ✅
              </button>
            </div>
          )}

          <div style={styles.progressBar}>
            <div style={{ ...styles.progress, width: `${progressPercentage}%` }}></div>
          </div>
          <div style={styles.stats}>{deck.length} Karten verbleibend</div>

          <button onClick={handleReset} style={styles.resetBtn}>
            Zurück zur Übersicht
          </button>
        </div>
      )}
    </div>
  );
}

// Inline Styles
const styles = {
  body: {
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },
  container: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: { marginTop: 0, color: '#333' },
  selectBox: { margin: '20px 0', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'left' },
  select: { width: '100%', padding: '12px', borderRadius: '6px', border: '2px solid #cbd5e1', fontSize: '16px', marginBottom: '5px' },
  radioContainer: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#334155', cursor: 'pointer' },
  radioInput: { width: '18px', height: '18px', cursor: 'pointer' },
  button: { width: '100%', padding: '12px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' },
  card: { minHeight: '120px', border: '2px solid', borderRadius: '10px', padding: '30px 20px', margin: '20px 0', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', textAlign: 'center' },
  actionButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  progressBar: { backgroundColor: '#eee', borderRadius: '5px', height: '10px', width: '100%', marginTop: '20px', overflow: 'hidden' },
  progress: { backgroundColor: '#2ecc71', height: '100%', transition: 'width 0.3s' },
  stats: { fontSize: '14px', color: '#666', marginTop: '5px', textAlign: 'center' },
  resetBtn: { backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', padding: '6px 12px', marginTop: '30px', cursor: 'pointer', display: 'inline-block' }
};
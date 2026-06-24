import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Auth from './Auth';
import Upload from './Upload';
import VokabelGenerator from './KIVocabs';

import juraVocabs from './bolum1.json';
import bolum1_1 from './bolum2.json';
import drei from './bolum3.json';
import bolum1_2 from './bolum4.json';

const LEKTIONEN = {
  'Bölüm 1 (Türkisch)': juraVocabs,
  'Bölüm 1.1 (Türkisch)': bolum1_1,
  'Intermediate Wörter': drei,
  'Bölüm 1.2': bolum1_2
};

export default function App() {
  const [currentView, setCurrentView] = useState('quiz'); // 'quiz', 'auth', 'upload'
  const [user, setUser] = useState(null);
  
  const [selectedLektion, setSelectedLektion] = useState(Object.keys(LEKTIONEN)[0]);
  const [richtung, setRichtung] = useState('de-tr'); 
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [initialCount, setInitialCount] = useState(0);

  // User-Session prüfen
  useEffect(() => {
    const savedUser = localStorage.getItem('lern_user');
    if (savedUser) setUser(JSON.parse(savedUser));

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

  // Wenn ein User eingeloggt ist, laden wir optional seine DB-Vokabeln als eigene Lektion
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/vokabeln/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            // Normalisiere DB-Struktur (deutsch/zielsprache) auf vorn/hinten
            const dbLektion = data.map(v => ({ vorn: v.deutsch, hinten: v.zielsprache }));
            LEKTIONEN['Meine DB Vokabeln 📁'] = dbLektion;
          }
        }).catch(err => console.log("Fehler beim Laden der DB Vokabeln", err));
    } else {
      delete LEKTIONEN['Meine DB Vokabeln 📁'];
    }
  }, [user, currentView]);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem('lern_user', JSON.stringify(loggedUser));
    setCurrentView('quiz');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lern_user');
    setCurrentView('quiz');
  };

  const handleStartQuiz = () => {
    const rawData = LEKTIONEN[selectedLektion];
    if (!rawData || rawData.length === 0) return;

    const normalizedDeck = rawData.map(item => {
      const originalVorn = item.vorn || Object.values(item)[0];
      const originalHinten = item.hinten || Object.values(item)[1];
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

  const handleWrong = () => {
    const updatedDeck = [...deck];
    const currentCard = updatedDeck.splice(currentIndex, 1)[0];
    updatedDeck.push(currentCard);
    setDeck(updatedDeck);
    setIsShowingAnswer(false);
    localStorage.setItem('anki_react_deck', JSON.stringify(updatedDeck));
  };

  const handleCorrect = () => {
    const updatedDeck = [...deck];
    updatedDeck.splice(currentIndex, 1);
    setDeck(updatedDeck);
    setIsShowingAnswer(false);
    localStorage.setItem('anki_react_deck', JSON.stringify(updatedDeck));
  };

  const handleReset = () => {
    if (window.confirm("Möchtest du das aktuelle Deck beenden?")) {
      localStorage.removeItem('anki_react_deck');
      localStorage.removeItem('anki_react_total');
      setQuizStarted(false);
      setDeck([]);
    }
  };

  const progressPercentage = initialCount > 0 ? ((initialCount - deck.length) / initialCount) * 100 : 100;
  const currentCard = deck[currentIndex];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={handleLogout} />
      
      <div style={styles.body}>
        {currentView === 'auth' && <Auth onLoginSuccess={handleLogin} />}
        {currentView === 'upload' && <Upload user={user} />}
        
        {currentView === 'quiz' && (
          !quizStarted ? (
            <div style={styles.container}>
              <h1 style={styles.title}>Anki Flashcards</h1>
              <div style={styles.selectBox}>
                <label style={{ fontWeight: 'bold', color: '#475569' }}>Wähle eine Lektion:</label>
                <select value={selectedLektion} onChange={(e) => setSelectedLektion(e.target.value)} style={styles.select}>
                  {Object.keys(LEKTIONEN).map(name => <option key={name} value={name}>{name}</option>)}
                </select>

                <label style={{ fontWeight: 'bold', color: '#475569', marginTop: '15px', display: 'block' }}>Sprachrichtung:</label>
                <div style={styles.radioContainer}>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="richtung" checked={richtung === 'de-tr'} onChange={() => setRichtung('de-tr')} /> Deutsch → Zielsprache
                  </label>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="richtung" checked={richtung === 'tr-de'} onChange={() => setRichtung('tr-de')} /> Zielsprache → Deutsch
                  </label>
                </div>
                <button onClick={handleStartQuiz} style={{ ...styles.button, backgroundColor: '#2ecc71', marginTop: '20px' }}>Lektion starten</button>
              </div>
              <VokabelGenerator/>
            </div>
          ) : (
            <div style={styles.container}>
              <h2>{isShowingAnswer ? 'Antwort' : 'Frage'}</h2>
              <div onClick={() => !isShowingAnswer && setIsShowingAnswer(true)} style={{ ...styles.card, backgroundColor: isShowingAnswer ? '#fffdf0' : '#f9f9f9', borderColor: isShowingAnswer ? '#f1c40f' : '#eee' }}>
                {deck.length === 0 ? <span style={{ fontSize: '24px' }}>🎉 Alles gelernt!</span> : (isShowingAnswer ? currentCard.hinten : currentCard.vorn)}
              </div>
              {deck.length > 0 && !isShowingAnswer && <button onClick={() => setIsShowingAnswer(true)} style={styles.button}>Antwort aufdecken</button>}
              {deck.length > 0 && isShowingAnswer && (
                <div style={styles.actionButtons}>
                  <button onClick={handleWrong} style={{ ...styles.button, backgroundColor: '#e74c3c' }}>Falsch ❌</button>
                  <button onClick={handleCorrect} style={{ ...styles.button, backgroundColor: '#2ecc71' }}>Gewusst! ✅</button>
                </div>
              )}
              <div style={styles.progressBar}><div style={{ ...styles.progress, width: `${progressPercentage}%` }}></div></div>
              <div style={styles.stats}>{deck.length} Karten verbleibend</div>
              <button onClick={handleReset} style={styles.resetBtn}>Zurück zur Übersicht</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Styles aus deiner App (gekürzt für Übersichtlichkeit)
const styles = {
  body: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  container: { width: '100%', maxWidth: '600px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center' },
  selectBox: { margin: '20px 0', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'left' },
  select: { width: '100%', padding: '12px', borderRadius: '6px', border: '2px solid #cbd5e1', fontSize: '16px' },
  radioContainer: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', cursor: 'pointer' },
  button: { width: '100%', padding: '12px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  card: { minHeight: '120px', border: '2px solid', borderRadius: '10px', padding: '30px 20px', margin: '20px 0', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  actionButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  progressBar: { backgroundColor: '#eee', borderRadius: '5px', height: '10px', width: '100%', marginTop: '20px', overflow: 'hidden' },
  progress: { backgroundColor: '#2ecc71', height: '100%', transition: 'width 0.3s' },
  stats: { fontSize: '14px', color: '#666', marginTop: '5px' },
  resetBtn: { backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', padding: '6px 12px', marginTop: '30px', cursor: 'pointer' }
};
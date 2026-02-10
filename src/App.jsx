import { useState } from 'react'
import './App.css'

function App() {
  const [stampedIndices, setStampedIndices] = useState([]);
  const totalKeys = 10;

  const toggleStamp = (index) => {
    if (stampedIndices.includes(index)) {
      setStampedIndices(stampedIndices.filter(i => i !== index));
    } else {
      setStampedIndices([...stampedIndices, index]);
    }
  };

  const resetCard = () => {
    setStampedIndices([]);
  };

  const stampCount = stampedIndices.length;
  const keysRemaining = totalKeys - stampCount;
  const isUnlocked = stampCount === totalKeys;

  return (
    <div className="card">
      <div className="header">
        <div className="lock-icon">🔒</div>
        <h1>REWARD CARD</h1>
        <div className="subtitle">Earn 10 keys to unlock a reward...</div>
      </div>

      <div className="stamps-container">
        {[...Array(totalKeys)].map((_, index) => (
          <div
            key={index}
            className={`stamp ${stampedIndices.includes(index) ? 'stamped' : ''}`}
            onClick={() => toggleStamp(index)}
          >
            <span className="key">🗝️</span>
          </div>
        ))}
      </div>

      <div className="counter">
        Keys Collected: <span id="count">{stampCount}</span>/{totalKeys}
      </div>

      <div className="lock-status">
        {!isUnlocked ? (
          <div className="lock-status-locked" id="locked-status">
            🔒 <strong>LOCKED</strong> - <span id="keys-remaining">{keysRemaining}</span> keys remaining
          </div>
        ) : (
          <div className="lock-status-unlocked" id="unlocked-status">
            🔓 <strong>UNLOCKED!</strong> - All keys collected
          </div>
        )}
      </div>

      <div className={`reward ${isUnlocked ? 'show' : ''}`} id="reward">
        🔓 LOCK RELEASED! 🔓<br />
        You've earned your freedom!
      </div>

      <button className="reset-btn" onClick={resetCard}>Reset Card</button>

      <div className="fine-print">
        Keys may be reset at Bae's discretion for bad behaviour, disobedience or any other reason - with no explanation required.
      </div>
    </div>
  )
}

export default App

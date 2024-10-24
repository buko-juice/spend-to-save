import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import './App.css';
import logo from './logo.svg'; // Replace with your own logo later

const STEPS = {
  ASK_PURCHASE: 0,
  ENTER_AMOUNT: 1,
  SHOW_SAVINGS: 2,
  CONFIRM_SAVINGS: 3,
  COMPLETE: 4
};

const PURCHASE_TYPES = {
  FRIVOLOUS: 'Frivolous',
  NON_FRIVOLOUS: 'Non-Frivolous'
};

function App() {
  const [step, setStep] = useState(STEPS.ASK_PURCHASE);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [totalSpending, setTotalSpending] = useState(() => {
    const saved = localStorage.getItem('totalSpending');
    return saved ? parseFloat(saved) : 0;
  });
  const [frivolousSpending, setFrivolousSpending] = useState(() => {
    const saved = localStorage.getItem('frivolousSpending');
    return saved ? parseFloat(saved) : 0;
  });
  const [nonFrivolousSpending, setNonFrivolousSpending] = useState(() => {
    const saved = localStorage.getItem('nonFrivolousSpending');
    return saved ? parseFloat(saved) : 0;
  });
  const [totalSavings, setTotalSavings] = useState(() => {
    const saved = localStorage.getItem('totalSavings');
    return saved ? parseFloat(saved) : 0;
  });
  const [purchaseType, setPurchaseType] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [spendingHistory, setSpendingHistory] = useState(() => {
    const saved = localStorage.getItem('spendingHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [manualEntryType, setManualEntryType] = useState('');
  const [manualEntryAmount, setManualEntryAmount] = useState('');

  useEffect(() => {
    localStorage.setItem('totalSpending', totalSpending.toString());
    localStorage.setItem('frivolousSpending', frivolousSpending.toString());
    localStorage.setItem('nonFrivolousSpending', nonFrivolousSpending.toString());
    localStorage.setItem('totalSavings', totalSavings.toString());
    localStorage.setItem('spendingHistory', JSON.stringify(spendingHistory));
  }, [totalSpending, frivolousSpending, nonFrivolousSpending, totalSavings, spendingHistory]);

  const handlePurchaseType = (type) => {
    setPurchaseType(type);
    setStep(STEPS.ENTER_AMOUNT);
  };

  const handleAmountSubmit = () => {
    const amount = parseFloat(purchaseAmount);
    if (amount > 0) {
      setTotalSpending(prev => prev + amount);
      if (purchaseType === PURCHASE_TYPES.FRIVOLOUS) {
        setFrivolousSpending(prev => prev + amount);
        setSavingsAmount(amount * 0.1);
        setStep(STEPS.SHOW_SAVINGS);
      } else {
        setNonFrivolousSpending(prev => prev + amount);
        addToSpendingHistory(amount, PURCHASE_TYPES.NON_FRIVOLOUS, 0);
        setStep(STEPS.COMPLETE);
      }
      setShowEncouragement(false);
    }
  };

  const handleSavingsConfirm = (confirmed) => {
    if (confirmed) {
      setTotalSavings(prev => prev + savingsAmount);
      addToSpendingHistory(parseFloat(purchaseAmount), PURCHASE_TYPES.FRIVOLOUS, savingsAmount);
      setStep(STEPS.COMPLETE);
      setShowEncouragement(false);
    } else {
      setShowEncouragement(true);
    }
  };

  const addToSpendingHistory = (amount, type, savings) => {
    setSpendingHistory(prev => [...prev, {
      date: new Date().toISOString(),
      amount: amount,
      type: type,
      savings: savings
    }]);
  };

  const resetProcess = () => {
    setStep(STEPS.ASK_PURCHASE);
    setPurchaseAmount('');
    setSavingsAmount(0);
    setPurchaseType('');
    setShowEncouragement(false);
  };

  const handleManualEntry = () => {
    const amount = parseFloat(manualEntryAmount);
    if (amount > 0) {
      switch (manualEntryType) {
        case PURCHASE_TYPES.FRIVOLOUS:
          setTotalSpending(prev => prev + amount);
          setFrivolousSpending(prev => prev + amount);
          addToSpendingHistory(amount, PURCHASE_TYPES.FRIVOLOUS, 0);
          break;
        case PURCHASE_TYPES.NON_FRIVOLOUS:
          setTotalSpending(prev => prev + amount);
          setNonFrivolousSpending(prev => prev + amount);
          addToSpendingHistory(amount, PURCHASE_TYPES.NON_FRIVOLOUS, 0);
          break;
        case 'Savings':
          setTotalSavings(prev => prev + amount);
          addToSpendingHistory(amount, 'Manual Savings', amount);
          break;
        default:
          break;
      }
      setManualEntryAmount('');
      alert(`Successfully added $${amount.toFixed(2)} to ${manualEntryType}.`);
    } else {
      alert('Please enter a valid amount.');
    }
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      requestIdleCallback(() => {
        localStorage.removeItem('totalSpending');
        localStorage.removeItem('frivolousSpending');
        localStorage.removeItem('nonFrivolousSpending');
        localStorage.removeItem('totalSavings');
        localStorage.removeItem('spendingHistory');
        
        requestAnimationFrame(() => {
          setTotalSpending(0);
          setFrivolousSpending(0);
          setNonFrivolousSpending(0);
          setTotalSavings(0);
          setSpendingHistory([]);
          
          setTimeout(() => {
            alert("All data has been cleared.");
          }, 0);
        });
      });
    }
  };

  const debouncedClearAllData = debounce(clearAllData, 300);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Spend to Save Logo" className="App-logo" />
        <h1>Spend to Save</h1>
      </header>
      <div className="app-container">
        <main>
          <div className="totals-summary">
            <p>Total Spending: ${totalSpending.toFixed(2)}</p>
            <p>Frivolous Spending: ${frivolousSpending.toFixed(2)}</p>
            <p>Non-Frivolous Spending: ${nonFrivolousSpending.toFixed(2)}</p>
            <p>Total Savings: ${totalSavings.toFixed(2)}</p>
            <button onClick={toggleHistory}>
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>

          {showHistory && (
            <section className="history">
              <h2>Spending and Savings History</h2>
              {spendingHistory.length === 0 ? (
                <p>No entries recorded yet.</p>
              ) : (
                <ul>
                  {spendingHistory.map((entry, index) => (
                    <li key={index}>
                      {new Date(entry.date).toLocaleDateString()}: ${entry.amount.toFixed(2)} ({entry.type})
                      {entry.savings > 0 && ` - Saved: $${entry.savings.toFixed(2)}`}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {step === STEPS.ASK_PURCHASE && (
            <section className="purchase-question">
              <h2>What type of purchase did you make?</h2>
              <button onClick={() => handlePurchaseType(PURCHASE_TYPES.FRIVOLOUS)}>Frivolous</button>
              <button onClick={() => handlePurchaseType(PURCHASE_TYPES.NON_FRIVOLOUS)}>Non-Frivolous</button>
            </section>
          )}

          {step === STEPS.ENTER_AMOUNT && (
            <section>
              <h2>How much did you spend?</h2>
              <input 
                type="number" 
                value={purchaseAmount} 
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="Enter amount in $"
              />
              <button onClick={handleAmountSubmit}>Submit</button>
            </section>
          )}

          {step === STEPS.SHOW_SAVINGS && (
            <section>
              <h2>Time to save!</h2>
              <p>Based on your frivolous purchase of ${purchaseAmount}, you should save at least:</p>
              <h3>${savingsAmount.toFixed(2)}</h3>
              <p>This is 10% of your purchase amount.</p>
              <h3>Did you set aside this savings?</h3>
              <button onClick={() => handleSavingsConfirm(true)}>Yes</button>
              <button onClick={() => handleSavingsConfirm(false)}>Not yet</button>
              {showEncouragement && (
                <div className="encouragement-message">
                  <p>Every bit of savings helps! Setting aside this amount now can make a big difference in the long run. Why not take a moment to transfer it to your savings account?</p>
                </div>
              )}
            </section>
          )}

          {step === STEPS.COMPLETE && (
            <section>
              <h2>Great job!</h2>
              <p>You're on your way to better financial health. 🎉</p>
              <button onClick={resetProcess}>Record Another Purchase</button>
            </section>
          )}

          <section className="manual-entry">
            <h2>Manual Entry</h2>
            <select 
              value={manualEntryType} 
              onChange={(e) => setManualEntryType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value={PURCHASE_TYPES.FRIVOLOUS}>Frivolous Purchase</option>
              <option value={PURCHASE_TYPES.NON_FRIVOLOUS}>Non-Frivolous Purchase</option>
              <option value="Savings">Savings</option>
            </select>
            <input 
              type="number" 
              value={manualEntryAmount} 
              onChange={(e) => setManualEntryAmount(e.target.value)}
              placeholder="Enter amount in $"
            />
            <button onClick={handleManualEntry}>Add Entry</button>
          </section>

          <div className="privacy-disclaimer">
            <p>Privacy Notice: All data is stored locally on your device. No personal information is sent to or stored on our servers.</p>
            <button onClick={debouncedClearAllData} className="clear-data-btn">Clear My Data</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
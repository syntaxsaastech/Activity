import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import FoodItem from './FoodItem'
import HistoryView from './HistoryView'
import ProgressBar from './ProgressBar'
import { showReminder } from '../services/notifications'
import { getFood } from '../services/foodApi'

export default function FoodList({ items, onDelete, onRestore }) {
  const [activeTab, setActiveTab] = useState('today')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
  const [limits, setLimits] = useState({
    calories: 2000, protein: 50, sodium: 2300, potassium: 3500, sugar: 50, fiber: 30, calcium: 1000, iron: 18
  })
  
  // Undo State
  const [undoItem, setUndoItem] = useState(null)
  const undoTimerRef = useRef(null)
  const hasAlertedRef = useRef(false)

  useEffect(() => {
    Papa.parse('/limits.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedLimits = {}
        results.data.forEach(row => {
          if (row.nutrient) parsedLimits[row.nutrient.trim()] = Number(row.limit)
        })
        setLimits(prev => ({ ...prev, ...parsedLimits }))
      }
    })
  }, [])

  const filtered = items.filter((i) => i.date === selectedDate)

  const totals = filtered.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.protein || 0),
    sodium: acc.sodium + (item.sodium || 0),
    potassium: acc.potassium + (item.potassium || 0),
    sugar: acc.sugar + (item.sugar || 0),
    fiber: acc.fiber + (item.fiber || 0),
    calcium: acc.calcium + (item.calcium || 0),
    iron: acc.iron + (item.iron || 0),
  }), { calories: 0, protein: 0, sodium: 0, potassium: 0, sugar: 0, fiber: 0, calcium: 0, iron: 0 })

  // Limit Reminder
  useEffect(() => {
    if (filtered.length === 0) return;
    const exceeded = [];
    if (totals.sugar > limits.sugar) exceeded.push('Sugar');
    if (totals.sodium > limits.sodium) exceeded.push('Sodium');
    
    if (exceeded.length > 0 && !hasAlertedRef.current) {
      showReminder("Limit Exceeded!", `You exceeded: ${exceeded.join(', ')}.`);
      hasAlertedRef.current = true; 
    }
    if (exceeded.length === 0) hasAlertedRef.current = false;
  }, [totals, limits, filtered.length])

  // Handle Delete with Undo
  const handleDeleteWithUndo = (item) => {
    onDelete(item.id) // Hide immediately
    setUndoItem(item) // Store for undo
    
    // Clear any previous undo timer
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)

    // Set 5 second timer to clear the undo option
    undoTimerRef.current = setTimeout(() => {
      setUndoItem(null)
    }, 5000)
  }

  const handleUndo = () => {
    if (undoItem) {
      // Put it back!
      const currentData = getFood()
      const newData = [...currentData, undoItem]
      localStorage.setItem('food-data', JSON.stringify(newData))
      
      // Tell App to re-render
      onDelete(null) // Hacky way to trigger refresh by calling onDelete with null
      window.location.reload() // Hard refresh to ensure it comes back instantly
      
      setUndoItem(null)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }

  const groupedItems = {
    Breakfast: filtered.filter(i => i.meal === 'Breakfast'),
    Lunch: filtered.filter(i => i.meal === 'Lunch'),
    Dinner: filtered.filter(i => i.meal === 'Dinner'),
    Snack: filtered.filter(i => i.meal === 'Snack'),
  }

  return (
    <div className="food-list" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => setActiveTab('today')} style={{ flex: 1, padding: '10px', background: activeTab === 'today' ? '#4CAF50' : '#e0e0e0', color: activeTab === 'today' ? 'white' : 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Today's List</button>
        <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: '10px', background: activeTab === 'history' ? '#4CAF50' : '#e0e0e0', color: activeTab === 'history' ? 'white' : 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>📊 History Chart</button>
      </div>

      {activeTab === 'history' ? (
        <HistoryView items={items} onDelete={(id) => handleDeleteWithUndo(items.find(i => i.id === id))} />
      ) : (
        <>
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong>View Date:</strong>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>

          {filtered.length === 0 ? (
            <div className="empty"><p>🍽️</p><p>No food added for {selectedDate}.</p></div>
          ) : (
            <>
              <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Daily Progress</h4>
                <ProgressBar label="🔥 Calories" current={totals.calories} max={limits.calories} unit="kcal" color="#4CAF50" />
                <ProgressBar label="🍗 Protein" current={totals.protein} max={limits.protein} unit="g" color="#2196f3" />
                <ProgressBar label="🧂 Sodium" current={totals.sodium} max={limits.sodium} unit="mg" color="#ff9800" />
                <ProgressBar label="🍬 Sugar" current={totals.sugar} max={limits.sugar} unit="g" color="#e91e63" />
              </div>

              {Object.entries(groupedItems).map(([mealName, mealItems]) => {
                if (mealItems.length === 0) return null;
                const mealTotals = mealItems.reduce((acc, i) => acc + (Number(i.calories) || 0), 0);
                
                return (
                  <div key={mealName} style={{ marginBottom: '20px' }}>
                    <h3 style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '5px' }}>
                      <span>{mealName}</span>
                      <span style={{ color: '#4CAF50', fontSize: '15px' }}>{mealTotals.toFixed(0)} cal</span>
                    </h3>
                    {mealItems.map((item) => (
                      <FoodItem key={item.id} item={item} onDelete={() => handleDeleteWithUndo(item)} />
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </>
      )}

      {/* UNDO POPUP BAR */}
      {undoItem && (
        <div style={{ 
          position: 'fixed', bottom: '70px', left: '20px', right: '20px', 
          background: '#333', color: 'white', padding: '15px', 
          borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <span style={{ fontSize: '14px' }}>"{undoItem.name}" deleted.</span>
          <button 
            onClick={handleUndo}
            style={{ background: 'transparent', color: '#4CAF50', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  )
}
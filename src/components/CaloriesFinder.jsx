import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export default function CaloriesFinder() {
  const [csvData, setCsvData] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [cart, setCart] = useState([])
  const [showText, setShowText] = useState(false) // Toggle text view

  useEffect(() => {
    Papa.parse('/cal.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.trim().toLowerCase();
            if (cleanKey !== 'pk' && cleanKey !== '__parsed_extra') {
              newRow[cleanKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
            }
          });

          // 🚨 SMART AUTO-CORRECTOR 🚨
          // If the "meal" column has a number (like "1 plate" or "100 g"),
          // it means you forgot to write "Lunch" or "Dinner". 
          // We will shift all data 1 column to the right to fix it!
          if (newRow.meal && newRow.meal.match(/\d/) && !newRow.meal.toLowerCase().includes('breakfast') && !newRow.meal.toLowerCase().includes('lunch') && !newRow.meal.toLowerCase().includes('dinner') && !newRow.meal.toLowerCase().includes('snack')) {
             return {
               name: newRow.name,
               meal: 'Lunch', // Default to Lunch
               quantity: newRow.meal,
               calories: newRow.quantity,
               protein: newRow.calories,
               sodium: newRow.protein,
               potassium: newRow.sodium,
               sugar: newRow.potassium,
               fiber: newRow.sugar,
               calcium: newRow.fiber,
               iron: newRow.calcium,
             }
          }

          // If meal is completely missing or invalid, set to Snack
          if (!newRow.meal || !['breakfast', 'lunch', 'dinner', 'snack'].includes(newRow.meal.toLowerCase())) {
            newRow.meal = 'Snack';
          } else {
            newRow.meal = newRow.meal.charAt(0).toUpperCase() + newRow.meal.slice(1);
          }

          return newRow;
        }).filter(row => row.name);
        
        setCsvData(cleaned)
      }
    })
  }, [])

  const addToCart = (food) => {
    setCart([...cart, { ...food, cartId: Date.now() + Math.random() }])
    setSearch('')
    setShowDropdown(false)
  }

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId))
  }

  const updateCartItem = (cartId, field, value) => {
    setCart(cart.map(item => 
      item.cartId === cartId ? { ...item, [field]: value } : item
    ))
  }

  const filteredFoods = csvData.filter(f => {
    if (!f || !f.name) return false; 
    return f.name.toLowerCase().includes(search.toLowerCase());
  })

  const totals = cart.reduce((acc, item) => ({
    calories: acc.calories + (Number(item.calories) || 0),
    protein: acc.protein + (Number(item.protein) || 0),
    sodium: acc.sodium + (Number(item.sodium) || 0),
    potassium: acc.potassium + (Number(item.potassium) || 0),
    sugar: acc.sugar + (Number(item.sugar) || 0),
    fiber: acc.fiber + (Number(item.fiber) || 0),
    calcium: acc.calcium + (Number(item.calcium) || 0),
    iron: acc.iron + (Number(item.iron) || 0),
  }), { calories: 0, protein: 0, sodium: 0, potassium: 0, sugar: 0, fiber: 0, calcium: 0, iron: 0 })

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>🔍 Calories Finder</h2>
        <button 
          onClick={() => setShowText(!showText)}
          style={{ padding: '8px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}
        >
          {showText ? 'Hide Text Data' : 'Show Text Data'}
        </button>
      </div>

      {/* TEXT VIEW (To verify columns) */}
      {showText ? (
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
          <p><strong>Total Items Loaded: {csvData.length}</strong></p>
          {csvData.map((item, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid #ddd', padding: '8px 0' }}>
              <div><strong>Name:</strong> {item.name}</div>
              <div><strong>Meal:</strong> {item.meal} | <strong>Qty:</strong> {item.quantity}</div>
              <div><strong>Calories:</strong> {item.calories} | <strong>Protein:</strong> {item.protein}g</div>
              <div><strong>Sodium:</strong> {item.sodium}mg | <strong>Sugar:</strong> {item.sugar}g</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            Search foods, add them to your analysis list, and see the total nutrition.
          </p>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Search any food (e.g., rice)..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onClick={() => setShowDropdown(true)}
              style={{ width: '100%', padding: '14px', fontSize: '16px', border: '2px solid #2196f3', borderRadius: '10px' }}
            />
            
            {showDropdown && search && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, 
                background: 'white', border: '1px solid #ccc', borderRadius: '8px', 
                maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => addToCart(food)}
                      style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <strong>{food.name}</strong> 
                      <span style={{ color: '#888', fontSize: '12px' }}>{food.calories} cal ({food.meal})</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', color: '#888', fontSize: '14px' }}>No match found.</div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Your Analysis Plate ({cart.length} items)</h3>
            {cart.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Search above to add food.</p>
            ) : (
              cart.map((item) => (
                <div key={item.cartId} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '15px' }}>{item.name}</strong>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>Qty:</span>
                      <input 
                        type="text" 
                        value={item.quantity || ''} 
                        onChange={(e) => updateCartItem(item.cartId, 'quantity', e.target.value)}
                        style={{ width: '60px', padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>Calories:</span>
                      <input 
                        type="number" 
                        value={item.calories || 0} 
                        onChange={(e) => updateCartItem(item.cartId, 'calories', e.target.value)}
                        style={{ width: '60px', padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.cartId)}
                    style={{ background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px' }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', border: '2px solid #4CAF50' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#2E7D32' }}>📊 Total Nutrition Analysis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🔥 Calories: <b>{totals.calories.toFixed(1)}</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🍗 Protein: <b>{totals.protein.toFixed(1)}g</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🧂 Sodium: <b>{totals.sodium.toFixed(1)}mg</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🍌 Potassium: <b>{totals.potassium.toFixed(1)}mg</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🍬 Sugar: <b>{totals.sugar.toFixed(1)}g</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🌾 Fiber: <b>{totals.fiber.toFixed(1)}g</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🦴 Calcium: <b>{totals.calcium.toFixed(1)}mg</b></div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>🩸 Iron: <b>{totals.iron.toFixed(1)}mg</b></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
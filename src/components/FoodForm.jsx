import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export default function FoodForm({ onAdd }) {
  const [csvData, setCsvData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchText, setSearchText] = useState('')
  
  const [cart, setCart] = useState([]) 

  const [meal, setMeal] = useState('Lunch')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))

  // 1. Load CSV
  useEffect(() => {
    Papa.parse('/fooditem.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedData = results.data.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.trim().toLowerCase();
            if (cleanKey !== 'pk' && cleanKey !== '__parsed_extra') {
              newRow[cleanKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
            }
          });
          return newRow;
        }).filter(row => row.name);
        setCsvData(cleanedData)
      }
    })
  }, [])

  // 2. Add food to the Cart (STRICT MATCH)
  const addToCart = (foodName, isCustom = false) => {
    // We use EXACT match here. If the CSV has "Idli" and you click "Idli", it grabs exactly "Idli".
    const food = csvData.find(f => f.name && f.name.toLowerCase() === foodName.toLowerCase())
    
    if (food && !isCustom) {
      setCart([...cart, { ...food, cartId: Date.now() + Math.random() }]) 
    } else {
      setCart([...cart, { 
        name: foodName, 
        quantity: '1', 
        calories: 0, protein: 0, sodium: 0, potassium: 0, sugar: 0, fiber: 0, calcium: 0, iron: 0, 
        cartId: Date.now() + Math.random() 
      }])
    }
    setSearchText('') 
    setShowDropdown(false) 
  }

  // 3. Handle Typing Commas and Pressing Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (!searchText.trim()) return;

      // Split by comma
      const items = searchText.split(',').map(i => i.trim()).filter(i => i !== '')
      
      items.forEach(item => {
        // Check if the typed item exists in the CSV
        const exactMatch = csvData.find(f => f.name && f.name.toLowerCase() === item.toLowerCase())
        
        if (exactMatch) {
           // If it exists (e.g., "Idli"), add the CSV data
           setCart(prev => [...prev, { ...exactMatch, cartId: Date.now() + Math.random() }])
        } else {
           // If not found, add as custom
           setCart(prev => [...prev, { 
             name: item, quantity: '1', 
             calories: 0, protein: 0, sodium: 0, potassium: 0, sugar: 0, fiber: 0, calcium: 0, iron: 0, 
             cartId: Date.now() + Math.random() 
           }])
        }
      })

      setSearchText('')
      setShowDropdown(false)
    }
  }

  // 4. Remove from Cart
  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId))
  }

  // 5. Update Cart Item
  const updateCartItem = (cartId, field, value) => {
    setCart(cart.map(item => 
      item.cartId === cartId ? { ...item, [field]: value } : item
    ))
  }

  // 6. Submit the Whole Cart
  const handleSubmit = (e) => {
    e.preventDefault()
    if (cart.length === 0) return alert("Please add some food to the plate first!")

    cart.forEach(item => {
      onAdd({
        name: item.name,
        meal: meal,
        quantity: item.quantity || '1',
        date: date,
        time: time,
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        sodium: Number(item.sodium) || 0,
        potassium: Number(item.potassium) || 0,
        sugar: Number(item.sugar) || 0,
        fiber: Number(item.fiber) || 0,
        calcium: Number(item.calcium) || 0,
        iron: Number(item.iron) || 0
      })
    })

    setCart([])
    setSearchText('')
  }

  // Filter foods for the dropdown (Only runs if you haven't typed a comma)
  const filteredFoods = csvData.filter(f => {
    if (!f || !f.name) return false; 
    return f.name.toLowerCase().includes(searchText.toLowerCase());
  })

  const cartTotals = cart.reduce((acc, item) => ({
    calories: acc.calories + (Number(item.calories) || 0),
    protein: acc.protein + (Number(item.protein) || 0),
  }), { calories: 0, protein: 0 })

  return (
    <form className="food-form" onSubmit={handleSubmit}>
      <h2>Add Food to {meal}</h2>
      
      <div className="row">
        <select value={meal} onChange={(e) => setMeal(e.target.value)}>
          <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {/* SEARCH BOX */}
      <div style={{ position: 'relative', marginTop: '10px' }}>
        <input 
          placeholder="Type 'Idli, Rasam' and press Enter..." 
          value={searchText} 
          onChange={(e) => { setSearchText(e.target.value); setShowDropdown(true); }} 
          onKeyDown={handleKeyDown}
          onClick={() => setShowDropdown(true)}
          style={{ width: '100%', padding: '14px', fontSize: '16px', border: '2px solid #2196f3', borderRadius: '10px' }}
        />
        
        {/* DROPDOWN RESULTS */}
        {showDropdown && searchText && !searchText.includes(',') && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, 
            background: 'white', border: '1px solid #ccc', borderRadius: '8px', 
            maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food, index) => (
                <div 
                  key={index} 
                  onClick={() => addToCart(food.name, false)} // Adds EXACT match
                  style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}
                >
                  <strong>{food.name}</strong> 
                  <span style={{ color: '#888', fontSize: '12px' }}>{food.calories} cal</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', color: '#888', fontSize: '14px' }}>Not found in CSV.</div>
            )}
            
            <div 
              onClick={() => addToCart(searchText, true)}
              style={{ padding: '12px', background: '#e3f2fd', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#1976d2' }}
            >
              + Add "{searchText}" manually
            </div>
          </div>
        )}
      </div>

      {/* THE PLATE / CART LIST */}
      <div style={{ marginTop: '20px' }}>
        <h3>Plate ({cart.length} items)</h3>
        {cart.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Search above to add food.</p>
        ) : (
          cart.map((item) => (
            <div key={item.cartId} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
              
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '15px' }}>{item.name}</strong>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <input 
                    type="text" 
                    value={item.quantity} 
                    onChange={(e) => updateCartItem(item.cartId, 'quantity', e.target.value)}
                    style={{ width: '60px', padding: '4px', fontSize: '12px' }}
                  />
                  <input 
                    type="number" 
                    value={item.calories} 
                    onChange={(e) => updateCartItem(item.cartId, 'calories', e.target.value)}
                    placeholder="Cal"
                    style={{ width: '60px', padding: '4px', fontSize: '12px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>kcal</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => removeFromCart(item.cartId)}
                style={{ background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* CART TOTALS & SUBMIT */}
      {cart.length > 0 && (
        <div style={{ marginTop: '15px', padding: '15px', background: '#e8f5e9', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Total: {cartTotals.calories.toFixed(0)} kcal | {cartTotals.protein.toFixed(1)}g Protein</p>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            ✓ Add {cart.length} Items to {meal}
          </button>
        </div>
      )}
    </form>
  )
}
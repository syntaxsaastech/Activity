import { useState } from 'react'
import FoodItem from './FoodItem'

export default function HistoryView({ items, onDelete }) {
  const [view, setView] = useState('year') // 'year', 'month', 'day'
  
  // Get current year as default
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Get unique years from data (plus current year)
  const availableYears = [...new Set(items.map(i => i.date.split('-')[0]))].sort((a, b) => b - a)
  if (!availableYears.includes(new Date().getFullYear().toString())) {
    availableYears.unshift(new Date().getFullYear().toString())
  }

  const calculateTotals = (foodArray) => {
    return foodArray.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      sodium: acc.sodium + (item.sodium || 0),
      potassium: acc.potassium + (item.potassium || 0),
      sugar: acc.sugar + (item.sugar || 0),
      fiber: acc.fiber + (item.fiber || 0),
      calcium: acc.calcium + (item.calcium || 0),
      iron: acc.iron + (item.iron || 0),
    }), { calories: 0, protein: 0, sodium: 0, potassium: 0, sugar: 0, fiber: 0, calcium: 0, iron: 0 })
  }

  // ================= YEAR VIEW =================
  if (view === 'year') {
    return (
      <div className="history-view">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Select a Month</h3>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold' }}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {months.map((month, index) => {
            const monthStr = String(index + 1).padStart(2, '0')
            // Filter foods for this specific Year and Month (e.g., "2026-01-15")
            const monthFoods = items.filter(i => i.date && i.date.startsWith(`${selectedYear}-${monthStr}`))
            const totals = calculateTotals(monthFoods)

            return (
              <button
                key={month}
                onClick={() => { setSelectedMonth(monthStr); setView('month') }}
                style={{ padding: '15px', background: '#f0f4c3', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <strong>{month}</strong><br />
                <span style={{ fontSize: '12px', color: '#666' }}>🔥 {totals.calories.toFixed(0)} cal</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ================= MONTH VIEW =================
  if (view === 'month') {
    const monthName = months[parseInt(selectedMonth) - 1]
    // Get unique days that have data in this specific year & month
    const daysInMonth = [...new Set(
      items
        .filter(i => i.date && i.date.startsWith(`${selectedYear}-${selectedMonth}`))
        .map(i => i.date.split('-')[2])
    )].sort()

    return (
      <div className="history-view">
        <button onClick={() => setView('year')} style={{ marginBottom: '15px', padding: '5px 10px' }}>← Back to Year</button>
        <h3>{monthName} {selectedYear} - Select a Day</h3>
        
        {daysInMonth.length === 0 ? (
          <p>No data for this month.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
            {daysInMonth.map(day => {
              // Use the dynamic selectedYear here
              const dayFoods = items.filter(i => i.date === `${selectedYear}-${selectedMonth}-${day}`) 
              const totals = calculateTotals(dayFoods)
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setView('day') }}
                  style={{ padding: '15px', background: '#e1bee7', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <strong>Day {day}</strong><br />
                  <span style={{ fontSize: '12px', color: '#666' }}>🔥 {totals.calories.toFixed(0)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ================= DAY VIEW =================
  if (view === 'day') {
    // Dynamic full date based on what was selected
    const fullDate = `${selectedYear}-${selectedMonth}-${selectedDay}` 
    const dayFoods = items.filter(i => i.date === fullDate)
    const totals = calculateTotals(dayFoods)

    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

    return (
      <div className="history-view">
        <button onClick={() => setView('month')} style={{ marginBottom: '15px', padding: '5px 10px' }}>← Back to Month</button>
        <h3>Date: {fullDate}</h3>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', marginBottom: '15px', marginTop: '10px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Daily Totals</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '13px' }}>
            <div>🔥 Calories: <b>{totals.calories.toFixed(1)}</b></div>
            <div>🍗 Protein: <b>{totals.protein.toFixed(1)}g</b></div>
            <div>🧂 Sodium: <b>{totals.sodium.toFixed(1)}mg</b></div>
            <div>🍌 Potassium: <b>{totals.potassium.toFixed(1)}mg</b></div>
            <div>🍬 Sugar: <b>{totals.sugar.toFixed(1)}g</b></div>
            <div>🌾 Fiber: <b>{totals.fiber.toFixed(1)}g</b></div>
            <div>🦴 Calcium: <b>{totals.calcium.toFixed(1)}mg</b></div>
            <div>🩸 Iron: <b>{totals.iron.toFixed(1)}mg</b></div>
          </div>
        </div>

        {meals.map(mealType => {
          const mealFoods = dayFoods.filter(f => f.meal === mealType)
          if (mealFoods.length === 0) return null

          return (
            <div key={mealType} style={{ marginBottom: '15px' }}>
              <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>{mealType}</h4>
              {mealFoods.map(item => (
                <FoodItem key={item.id} item={item} onDelete={onDelete} />
              ))}
            </div>
          )
        })}
      </div>
    )
  }
}
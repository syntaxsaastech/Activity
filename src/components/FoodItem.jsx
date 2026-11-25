import { useState } from 'react'

const mealEmoji = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' }

export default function FoodItem({ item, onDelete }) {
  const [isOpen, setIsOpen] = useState(false) // Toggle state

  return (
    <div style={{ marginBottom: '8px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
      
      {/* CLICKABLE HEADER */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isOpen ? '#f0f8ff' : '#fafafa', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{mealEmoji[item.meal] || '🍽️'}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{item.name}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{item.quantity} • {item.time}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>{item.calories} cal</span>
          <span style={{ color: '#888' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* EXPANDED NUTRITION DETAILS */}
      {isOpen && (
        <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#555' }}>
            <div>🍗 Protein: <b>{item.protein || 0}g</b></div>
            <div>🧂 Sodium: <b>{item.sodium || 0}mg</b></div>
            <div>🍌 Potassium: <b>{item.potassium || 0}mg</b></div>
            <div>🍬 Sugar: <b>{item.sugar || 0}g</b></div>
            <div>🌾 Fiber: <b>{item.fiber || 0}g</b></div>
            <div>🦴 Calcium: <b>{item.calcium || 0}mg</b></div>
            <div>🩸 Iron: <b>{item.iron || 0}mg</b></div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
            style={{ marginTop: '12px', background: '#ffebee', color: '#c62828', border: 'none', padding: '8px', borderRadius: '6px', width: '100%', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            Remove Item
          </button>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import FoodForm from './components/FoodForm'
import FoodList from './components/FoodList'
import BottomNav from './components/BottomNav'
import CaloriesFinder from './components/CaloriesFinder' // 👈 NEW
import { getFood, addFood, deleteFood, downloadExcel } from './services/foodApi'

export default function App() {
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('add')

  useEffect(() => {
    setItems(getFood())
  }, [])

  const handleAdd = (entry) => {
    addFood(entry)
    setItems(getFood())
    setTab('list')
  }

  const handleDelete = (id) => {
    deleteFood(id)
    setItems(getFood())
  }

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h1 style={{ margin: 0 }}>🍽️ Daily Food</h1>
          <button
            onClick={downloadExcel}
            style={{ background: 'white', color: '#4CAF50', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            📥 Excel
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'add' && <FoodForm onAdd={handleAdd} />}
        {tab === 'list' && <FoodList items={items} onDelete={handleDelete} />}
        {tab === 'finder' && <CaloriesFinder />} {/* 👈 NEW */}
      </main>

      <BottomNav active={tab} onChange={setTab} counts={items.filter(i => i.date === new Date().toISOString().split('T')[0]).length} />
    </div>
  )
}
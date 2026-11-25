import * as XLSX from 'xlsx'

const STORAGE_KEY = 'food-data'

export const getFood = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export const addFood = (food) => {
  const current = getFood()
  const newFood = { ...food, id: Date.now() }
  const updated = [...current, newFood]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return newFood
}

export const deleteFood = (id) => {
  const current = getFood()
  const updated = current.filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const downloadExcel = () => {
  const data = getFood()
  if (data.length === 0) {
    alert("No food data to export yet!")
    return
  }
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Food Data")
  XLSX.writeFile(workbook, "Daily_Food_Data.xlsx")
}
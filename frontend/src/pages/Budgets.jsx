import { useState, useEffect } from "react"
import api from "../api/client"

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    category_id: "",
    month: "",
    limit_amount: "",
  })

  const loadBudgets = () => {
    api.get("/budgets/")
      .then((res) => setBudgets(res.data))
      .catch((err) => setError(err.message))
  }

  const loadCategories = () => {
    api.get("/categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    api.post("/budgets/", {
      ...form,
      category_id: parseInt(form.category_id),
      limit_amount: parseFloat(form.limit_amount),
    })
      .then(() => {
        setForm({ category_id: "", month: "", limit_amount: "" })
        loadBudgets()
      })
      .catch((err) => setError(err.response?.data?.detail || err.message))
  }

  const handleDelete = (id) => {
    api.delete(`/budgets/${id}`)
      .then(() => loadBudgets())
      .catch((err) => setError(err.message))
  }

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "Unknown"

  return (
    <div>
      <h2>Budgets</h2>
      {error && <p className="error">Error: {JSON.stringify(error)}</p>}

      <div className="card">
        <form onSubmit={handleSubmit} className="form-row">
          <select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="month" name="month" value={form.month} onChange={handleChange} required
          />
          <input
            type="number" step="0.01" name="limit_amount" placeholder="Limit amount"
            value={form.limit_amount} onChange={handleChange} required
          />
          <button type="submit">Set Budget</button>
        </form>
      </div>

      <div className="card">
        <ul>
          {budgets.map((b) => (
            <li key={b.id}>
              <span>
                {categoryName(b.category_id)} — {b.month} — Rs {b.limit_amount}
              </span>
              <button onClick={() => handleDelete(b.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Budgets

import { useState, useEffect } from "react"
import api from "../api/client"

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    amount: "",
    category_id: "",
    date: "",
    description: "",
    type: "expense",
  })

  const loadTransactions = () => {
    api.get("/transactions/")
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(err.message))
  }

  const loadCategories = () => {
    api.get("/categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    api.post("/transactions/", {
      ...form,
      amount: parseFloat(form.amount),
      category_id: parseInt(form.category_id),
    })
      .then(() => {
        setForm({ amount: "", category_id: "", date: "", description: "", type: "expense" })
        loadTransactions()
      })
      .catch((err) => setError(err.response?.data?.detail || err.message))
  }

  const handleDelete = (id) => {
    api.delete(`/transactions/${id}`)
      .then(() => loadTransactions())
      .catch((err) => setError(err.message))
  }

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "Unknown"

  return (
    <div>
      <h2>Transactions</h2>
      {error && <p className="error">Error: {JSON.stringify(error)}</p>}

      <div className="card">
        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="number" step="0.01" name="amount" placeholder="Amount"
            value={form.amount} onChange={handleChange} required
          />
          <select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="date" name="date" value={form.date} onChange={handleChange} required
          />
          <input
            type="text" name="description" placeholder="Description"
            value={form.description} onChange={handleChange}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="card">
        <ul>
          {transactions.map((t) => (
            <li key={t.id}>
              <span>
                {t.date} — {t.description || "(no description)"} — {categoryName(t.category_id)}{" "}
                <span className={t.type === "expense" ? "amount-expense" : "amount-income"}>
                  Rs {t.amount}
                </span>
              </span>
              <button onClick={() => handleDelete(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Transactions

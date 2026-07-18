import { useState, useEffect } from "react"
import api from "../api/client"

function Categories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: "", type: "expense" })

  const loadCategories = () => {
    api.get("/categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    api.post("/categories/", form)
      .then(() => {
        setForm({ name: "", type: "expense" })
        loadCategories()
      })
      .catch((err) => setError(err.response?.data?.detail || err.message))
  }

  const handleDelete = (id) => {
    api.delete(`/categories/${id}`)
      .then(() => loadCategories())
      .catch((err) => setError(err.response?.data?.detail || err.message))
  }

  return (
    <div>
      <h2>Categories</h2>
      {error && <p className="error">Error: {JSON.stringify(error)}</p>}

      <div className="card">
        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="text" name="name" placeholder="Category name"
            value={form.name} onChange={handleChange} required
          />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button type="submit">Add Category</button>
        </form>
      </div>

      <div className="card">
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              <span>
                {cat.name}{" "}
                <span className={cat.type === "expense" ? "amount-expense" : "amount-income"}>
                  ({cat.type})
                </span>
              </span>
              <button onClick={() => handleDelete(cat.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Categories

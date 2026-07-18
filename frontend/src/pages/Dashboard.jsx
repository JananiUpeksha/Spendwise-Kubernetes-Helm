import { useState, useEffect } from "react"
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts"
import api from "../api/client"

const COLORS = ["#2f6fed", "#e74c3c", "#27ae60", "#f39c12", "#9b59b6", "#1abc9c"]

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [spendingByCategory, setSpendingByCategory] = useState([])
  const [budgetVsActual, setBudgetVsActual] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [error, setError] = useState(null)

  const loadData = () => {
    setError(null)
    api.get(`/analytics/spending-by-category?month=${month}`)
      .then((res) => setSpendingByCategory(res.data))
      .catch((err) => setError(err.message))

    api.get(`/analytics/budget-vs-actual?month=${month}`)
      .then((res) => setBudgetVsActual(res.data))
      .catch((err) => setError(err.message))

    api.get("/analytics/monthly-trend")
      .then((res) => setMonthlyTrend(res.data))
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p className="error">Error: {error}</p>}

      <div className="card">
        <label style={{ marginRight: "0.5rem", fontWeight: 500 }}>Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="card">
        <h3>Spending by Category</h3>
        {spendingByCategory.length === 0 ? (
          <p>No expenses recorded for this month.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category}: Rs ${entry.total}`}
              >
                {spendingByCategory.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Budget vs Actual</h3>
        {budgetVsActual.length === 0 ? (
          <p>No budgets set for this month.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsActual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="limit" fill="#2f6fed" name="Budget" />
              <Bar dataKey="spent" fill="#e74c3c" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Monthly Trend</h3>
        {monthlyTrend.length === 0 ? (
          <p>No transaction history yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#2f6fed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default Dashboard

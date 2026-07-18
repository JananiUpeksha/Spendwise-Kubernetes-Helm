import { BrowserRouter, Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar"
import Dashboard from "./pages/Dashboard"
import Categories from "./pages/Categories"
import Transactions from "./pages/Transactions"
import Budgets from "./pages/Budgets"

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <h1>SpendWise</h1>
        <p className="subtitle">Expense tracker with budget analytics</p>

        <NavBar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

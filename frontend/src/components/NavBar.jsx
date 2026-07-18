import { NavLink } from "react-router-dom"

function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/transactions">Transactions</NavLink>
      <NavLink to="/categories">Categories</NavLink>
      <NavLink to="/budgets">Budgets</NavLink>
    </nav>
  )
}

export default NavBar

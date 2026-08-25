import { Link } from 'react-router-dom'
import './pages.css'

function LandingPage() {
  return (
    <section className="page page-center">
      <h1>LiftShopCook</h1>
      <div className="actions">
        <Link to="/login" className="btn btn-primary">
          Log In
        </Link>
        <Link to="/create-account" className="btn btn-secondary">
          Create Account
        </Link>
      </div>
    </section>
  )
}

export default LandingPage

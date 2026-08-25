import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.ts'
import Icon from '../components/Icon.tsx'
import './pages.css'

function DashboardPage() {
  return (
    <section className="page page-center">
      <h1>Dashboard</h1>
      <div className="actions">
        <Link to="/calendar" className="btn btn-primary">
          <Icon name="calendar" size={16} />
          Calendar
        </Link>
        <Link to="/foods" className="btn btn-secondary">
          <Icon name="leaf" size={16} />
          My Foods
        </Link>
        <Link to="/recipes" className="btn btn-secondary">
          <Icon name="book" size={16} />
          My Recipes
        </Link>
      </div>

      <div className="back-row">
        <button type="button" className="back-link" onClick={() => signOut(auth)}>
          <Icon name="logout" size={15} />
          Log out
        </button>
      </div>
    </section>
  )
}

export default DashboardPage

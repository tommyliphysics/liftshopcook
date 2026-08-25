import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon.tsx'

function BackButton() {
  const navigate = useNavigate()

  return (
    <div className="back-row">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        <Icon name="arrow-left" size={15} />
        Back
      </button>
      <Link to="/dashboard" className="back-link">
        <Icon name="home" size={15} />
        Dashboard
      </Link>
    </div>
  )
}

export default BackButton

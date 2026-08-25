import Icon, { type IconName } from './Icon.tsx'

type StatButtonProps = {
  label: string
  value?: string
  icon?: IconName
  onClick: () => void
}

function StatButton({ label, value, icon, onClick }: StatButtonProps) {
  return (
    <button
      type="button"
      className={value ? 'btn btn-secondary btn-stat' : 'btn btn-secondary'}
      onClick={onClick}
    >
      <span className="btn-stat-label">
        {icon && <Icon name={icon} size={16} />}
        {label}
      </span>
      {value && <span>{value}</span>}
    </button>
  )
}

export default StatButton

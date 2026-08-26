import type { ReactNode } from 'react'

export type IconName =
  | 'chevron-down'
  | 'arrow-left'
  | 'home'
  | 'calendar'
  | 'cart'
  | 'leaf'
  | 'plus'
  | 'pencil'
  | 'warning'
  | 'book'
  | 'tag'
  | 'logout'
  | 'trash'
  | 'target'

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

const GLYPHS: Record<IconName, ReactNode> = {
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'arrow-left': <path d="M19 12H5M12 19l-7-7 7-7" />,
  home: (
    <path d="M4 11.5 12 4l8 7.5M6 10v8.5A1.5 1.5 0 0 0 7.5 20h3v-6h3v6h3a1.5 1.5 0 0 0 1.5-1.5V10" />
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.2 12.1A2 2 0 0 0 9.16 18h7.68a2 2 0 0 0 1.96-1.63L20 7H6" />
      <circle cx="9.5" cy="21" r="1.3" />
      <circle cx="17.5" cy="21" r="1.3" />
    </>
  ),
  leaf: (
    <path d="M5.5 19.5C13 19.5 18 14.3 18 5c-9.5 0-14.5 5-14.5 14.5ZM5.5 19.5c0-4.2 2-7.4 5-9.6" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  pencil: (
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 7.5l3 3" />
  ),
  warning: <path d="M12 3.5 2.5 20h19L12 3.5ZM12 10v4.2M12 17.3h.01" />,
  book: (
    <path d="M4 5.5c2-1.2 5-1.2 8 .5 3-1.7 6-1.7 8-.5v13c-2-1.2-5-1.2-8 .5-3-1.7-6-1.7-8-.5v-13ZM12 6v13" />
  ),
  tag: (
    <>
      <path d="M12.6 3h5.4a1 1 0 0 1 1 1v5.4a1 1 0 0 1-.3.7l-9 9a1 1 0 0 1-1.4 0l-5.4-5.4a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 .7-.3Z" />
      <circle cx="16" cy="7" r="1.2" />
    </>
  ),
  logout: (
    <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9M15 16l5-4-5-4M20 12H9" />
  ),
  trash: (
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
}

function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  )
}

export default Icon

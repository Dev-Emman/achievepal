import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const navItems = [
  { label: 'Dashboard', icon: '🏠', to: '/' },
  { label: 'Modules', icon: '📚', to: '/modules' },
  { label: 'Assignments', icon: '📝', to: '/assignments' },
  { label: 'Calendar', icon: '📅', to: '/calendar' },
  { label: 'Grades', icon: '🎯', to: '/grades' },
]

function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const current = navItems.find((item) => item.to === location.pathname)

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">AchievePal</div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="header">
          <h1>{current?.label ?? 'AchievePal'}</h1>
          <div className="header-user">
            <span className="header-email">{user?.email}</span>
            <button className="btn-secondary" onClick={signOut}>
              Log out
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
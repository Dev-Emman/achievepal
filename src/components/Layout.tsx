import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Target,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoMark from '../assets/logo-mark.png'
import './Layout.css'

const navItems = [
  {
    label: 'Dashboard',
    short: 'Home',
    to: '/',
    icon: LayoutDashboard,
    subtitle: 'Your deadlines and progress at a glance.',
  },
  {
    label: 'My Modules',
    short: 'Modules',
    to: '/modules',
    icon: BookOpen,
    subtitle: 'Manage your modules and see how each one is going.',
  },
  {
    label: 'Assignments',
    short: 'Assignments',
    to: '/assignments',
    icon: ClipboardList,
    subtitle: 'Keep track of your coursework and deadlines.',
  },
  {
    label: 'Calendar',
    short: 'Calendar',
    to: '/calendar',
    icon: CalendarDays,
    subtitle: 'Lectures, study sessions and important dates.',
  },
  {
    label: 'Grade Calculator',
    short: 'Grades',
    to: '/grades',
    icon: Target,
    subtitle: 'Work out your marks and what you need to hit your target.',
  },
]

// The pages shown in the phone bottom bar (everything else is under "More")
const bottomPaths = ['/', '/modules', '/assignments', '/grades']
const bottomItems = navItems.filter((item) => bottomPaths.includes(item.to))

function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const current = navItems.find((item) => item.to === location.pathname)
  const initial = (user?.email ?? '?').charAt(0).toUpperCase()

  // Let the Escape key close the phone menu
  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="layout">
      {menuOpen && (
        <div
          className="scrim"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-menu"
        className={menuOpen ? 'sidebar open' : 'sidebar'}
        aria-label="Main menu"
      >
        <div className="sidebar-top">
          <div className="brand">
            <img src={logoMark} alt="" className="brand-mark" />
            <span>AchievePal</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Main">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                isActive ? 'side-link active' : 'side-link'
              }
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-card">
          <span className="avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="user-email" title={user?.email}>
            {user?.email}
          </span>
          <button
            className="logout-btn"
            onClick={signOut}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <h1>{current?.label ?? 'AchievePal'}</h1>
          {current && <p className="header-sub">{current.subtitle}</p>}
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Quick navigation">
        {bottomItems.map(({ short, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              isActive ? 'bottom-link active' : 'bottom-link'
            }
          >
            <Icon size={22} aria-hidden="true" />
            <span>{short}</span>
          </NavLink>
        ))}
        <button
          className="bottom-link"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-controls="app-menu"
        >
          <Menu size={22} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </div>
  )
}

export default Layout
import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/img/env.png'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import useWindow from '../useWindow'

const Nav = () => {
  const { width } = useWindow()
  const { signOut, loginUser } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async (e) => {
    e.preventDefault()
    await signOut()
  }

  const initial = loginUser?.split('')[0]?.toUpperCase() ?? '?'

  return (
    <div className="w-full bg-app-surface sticky top-0 z-50 border-b border-app-border">
      <div className="max-w-full px-4">
        <nav className="flex items-center justify-between h-12">
          {/* Brand */}
          {/* <Link to="/d" className="flex items-center gap-2 no-underline">
            <img
              src={logo}
              width="24"
              height="24"
              alt="logo"
              className="rounded"
            />
            {width > 450 && (
              <span className="text-app-text font-bold text-sm">SiApp</span>
            )}
          </Link> */}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-app-bg text-app-text transition-colors border-none cursor-pointer bg-transparent"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <i className="bi bi-sun"></i>
              ) : (
                <i className="bi bi-moon-stars"></i>
              )}
            </button>

            {/* Avatar */}
            <div className="__avatar text-white text-xs font-bold">
              {initial}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-app-text opacity-80 hover:opacity-100 text-sm transition-colors no-underline bg-transparent border-none cursor-pointer"
            >
              <i className="bi bi-box-arrow-right"></i>
              {width > 450 && <span>Log Out</span>}
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Nav

